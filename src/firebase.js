// Complete localStorage-based replacement for Firebase.
// No Firebase account or configuration needed — everything stored in browser localStorage.
// All 19+ files that import from "../firebase" work unchanged.

const DB_PREFIX = "ep_";

// ─── Helpers ───
function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

function getData(key) {
  try { return JSON.parse(localStorage.getItem(DB_PREFIX + key)); } catch { return null; }
}
function setData(key, val) { localStorage.setItem(DB_PREFIX + key, JSON.stringify(val)); }
function removeData(key) { localStorage.removeItem(DB_PREFIX + key); }

// Users stored as: ep_users => { [uid]: { email, name, password (hash), plan, ... } }
function getUsers() { return getData("users") || {}; }
function setUsers(u) { setData("users", u); }
function getUser(id) { return getUsers()[id] || null; }
function setUser(id, data) { const u = getUsers(); u[id] = { ...u[id], ...data }; setUsers(u); }

// Session: current logged-in user
function getSession() { return getData("session") || null; }
function setSession(s) { setData("session", s); }
function clearSession() { removeData("session"); }

// Collections stored as: ep_coll_{name} => { [docId]: data }
function getColl(name) { return getData("coll_" + name) || {}; }
function setColl(name, data) { setData("coll_" + name, data); }
function getDocFromColl(coll, id) { const c = getColl(coll); return c[id] || null; }
function setDocInColl(coll, id, data) { const c = getColl(coll); c[id] = { ...c[id], ...data }; setColl(coll, c); }
function deleteDocFromColl(coll, id) { const c = getColl(coll); delete c[id]; setColl(coll, c); }

function simpleHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return "h" + Math.abs(h).toString(36);
}

// ─── Auth-like object ───
const authStateListeners = [];

function notifyAuthState(user) {
  authStateListeners.forEach(cb => { try { cb(user); } catch {} });
}

const localAuth = {
  currentUser: null,
  _setCurrentUser(u) {
    this.currentUser = u;
    if (u) setSession({ uid: u.uid, email: u.email, displayName: u.displayName });
    else clearSession();
    notifyAuthState(u);
  },
};

// ─── Exported auth ───
export const auth = {
  get currentUser() { return localAuth.currentUser; },
  onAuthStateChanged(callback) {
    authStateListeners.push(callback);
    // Fire immediately with current state
    const u = localAuth.currentUser;
    if (u) { try { callback(u); } catch {} }
    return () => {
      const idx = authStateListeners.indexOf(callback);
      if (idx >= 0) authStateListeners.splice(idx, 1);
    };
  },
  async signOut() {
    localAuth._setCurrentUser(null);
  },
};

export function onAuthStateChanged(authIgnored, callback) {
  authStateListeners.push(callback);
  const u = localAuth.currentUser;
  if (u) { try { callback(u); } catch {} }
  return () => {
    const idx = authStateListeners.indexOf(callback);
    if (idx >= 0) authStateListeners.splice(idx, 1);
  };
}

export async function createUserWithEmailAndPassword(authIgnored, email, password) {
  const users = getUsers();
  const existing = Object.values(users).find(u => u.email === email);
  if (existing) {
    const err = new Error("The email address is already in use by another account.");
    err.code = "auth/email-already-in-use";
    throw err;
  }
  const newUser = {
    uid: uid(),
    email,
    password: simpleHash(password),
    displayName: "",
    plan: null,
    planExpiry: null,
    role: "user",
    createdAt: Date.now(),
  };
  users[newUser.uid] = newUser;
  setUsers(users);
  const userObj = { uid: newUser.uid, email: newUser.email, displayName: newUser.displayName, plan: newUser.plan, planExpiry: newUser.planExpiry, role: newUser.role };
  localAuth._setCurrentUser(userObj);
  return { user: userObj };
}

export async function signInWithEmailAndPassword(authIgnored, email, password) {
  const users = getUsers();
  const found = Object.values(users).find(u => u.email === email);
  if (!found) {
    const err = new Error("There is no user record corresponding to this identifier.");
    err.code = "auth/user-not-found";
    throw err;
  }
  if (found.password !== simpleHash(password)) {
    const err = new Error("The password is invalid or the user does not have a password.");
    err.code = "auth/wrong-password";
    throw err;
  }
  const userObj = { uid: found.uid, email: found.email, displayName: found.displayName, plan: found.plan, planExpiry: found.planExpiry, role: found.role };
  localAuth._setCurrentUser(userObj);
  return { user: userObj };
}

export async function signOut(authIgnored) {
  localAuth._setCurrentUser(null);
}

export async function updateProfile(user, profile) {
  if (!user || !user.uid) return;
  const u = getUser(user.uid);
  if (!u) return;
  Object.assign(u, profile);
  setUser(user.uid, profile);
  if (localAuth.currentUser && localAuth.currentUser.uid === user.uid) {
    Object.assign(localAuth.currentUser, profile);
    notifyAuthState({ ...localAuth.currentUser });
  }
}

export async function sendPasswordResetEmail(authIgnored, email) {
  const users = getUsers();
  const found = Object.values(users).find(u => u.email === email);
  if (!found) {
    const err = new Error("There is no user record corresponding to this identifier.");
    err.code = "auth/user-not-found";
    throw err;
  }
  // Store a reset token
  const token = uid();
  setDocInColl("passwordResets", found.uid, { token, email, expires: Date.now() + 3600000 });
}

export async function deleteUser(user) {
  if (!user || !user.uid) return;
  const users = getUsers();
  delete users[user.uid];
  setUsers(users);
  deleteDocFromColl("users", user.uid);
  if (localAuth.currentUser && localAuth.currentUser.uid === user.uid) {
    localAuth._setCurrentUser(null);
  }
}

export const GoogleAuthProvider = function() {};
export const browserLocalPersistence = "local";
export async function setPersistence() {}

// ─── Firestore-like functions ───
export const db = { _local: true };

export function doc(dbInst, collectionName, docId) {
  return { _type: "doc", collection: collectionName, id: docId };
}

function isDocRef(v) { return v && v._type === "doc"; }
function isCollRef(v) { return v && v._type === "collection"; }

export function collection(dbInst, name) {
  return { _type: "collection", name };
}

export async function getDoc(docRef) {
  if (!isDocRef(docRef)) return { exists: () => false, data: () => null, id: null };
  const data = getDocFromColl(docRef.collection, docRef.id);
  return {
    id: docRef.id,
    exists: () => !!data,
    data: () => data ? { ...data } : null,
  };
}

export async function getDocs(queryRef) {
  let collName = queryRef;
  let filters = [];
  let sorts = [];
  let limitCount = 999999;

  // Handle Query objects created by query()
  if (queryRef && queryRef._type === "query") {
    collName = queryRef.collection;
    filters = queryRef.filters || [];
    sorts = queryRef.sorts || [];
    limitCount = queryRef.limitCount || 999999;
  } else if (queryRef && queryRef._type === "collection") {
    collName = queryRef.name;
  }

  const coll = getColl(typeof collName === "string" ? collName : (collName.name || collName));
  let entries = Object.entries(coll);

  // Apply where filters
  for (const f of filters) {
    if (f.op === "==") {
      entries = entries.filter(([id, d]) => getNested(d, f.field) === f.val);
    } else if (f.op === ">") {
      entries = entries.filter(([id, d]) => getNested(d, f.field) > f.val);
    } else if (f.op === ">=") {
      entries = entries.filter(([id, d]) => getNested(d, f.field) >= f.val);
    } else if (f.op === "<") {
      entries = entries.filter(([id, d]) => getNested(d, f.field) < f.val);
    } else if (f.op === "<=") {
      entries = entries.filter(([id, d]) => getNested(d, f.field) <= f.val);
    } else if (f.op === "in") {
      entries = entries.filter(([id, d]) => f.val.includes(getNested(d, f.field)));
    }
  }

  // Apply orderBy
  for (const s of sorts) {
    entries.sort((a, b) => {
      const va = getNested(a[1], s.field);
      const vb = getNested(b[1], s.field);
      if (va == null) return 1;
      if (vb == null) return -1;
      if (va < vb) return s.dir === "desc" ? 1 : -1;
      if (va > vb) return s.dir === "desc" ? -1 : 1;
      return 0;
    });
  }

  // Apply limit
  if (entries.length > limitCount) entries = entries.slice(0, limitCount);

  return {
    empty: entries.length === 0,
    size: entries.length,
    docs: entries.map(([id, data]) => ({
      id,
      data: () => ({ ...data }),
      exists: () => true,
    })),
    forEach: (cb) => entries.forEach(([id, data]) => cb({ id, data: () => ({ ...data }), exists: () => true })),
  };
}

async function getDocOrCreate(docRef) {
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : {};
}

export async function setDoc(docRef, data) {
  if (!isDocRef(docRef)) return;
  const existing = getDocFromColl(docRef.collection, docRef.id) || {};
  // If data has spread pattern at end ({...data}) or spread inside, preserve merge behavior
  setDocInColl(docRef.collection, docRef.id, { ...existing, ...data });
}

export async function updateDoc(docRef, data) {
  if (!isDocRef(docRef)) return;
  const existing = getDocFromColl(docRef.collection, docRef.id) || {};
  // Resolve sentinel values (increment, arrayUnion, etc.)
  const resolved = {};
  for (const [k, v] of Object.entries(data)) {
    if (v && v._sentinel === "increment") {
      resolved[k] = (existing[k] || 0) + v.value;
    } else if (v && v._sentinel === "arrayUnion") {
      const arr = existing[k] || [];
      for (const item of v.value) {
        if (!arr.includes(item)) arr.push(item);
      }
      resolved[k] = arr;
    } else if (v && v._sentinel === "serverTimestamp") {
      resolved[k] = Date.now();
    } else {
      resolved[k] = v;
    }
  }
  setDocInColl(docRef.collection, docRef.id, { ...existing, ...resolved });
}

export async function addDoc(collRef, data) {
  const collName = typeof collRef === "string" ? collRef : (collRef.name || collRef);
  const id = uid();
  const resolved = {};
  for (const [k, v] of Object.entries(data)) {
    if (v && v._sentinel === "serverTimestamp") resolved[k] = Date.now();
    else resolved[k] = v;
  }
  setDocInColl(collName, id, resolved);
  return { id, path: collName + "/" + id };
}

export async function deleteDoc(docRef) {
  if (!isDocRef(docRef)) return;
  deleteDocFromColl(docRef.collection, docRef.id);
}

export function serverTimestamp() {
  return { _sentinel: "serverTimestamp" };
}

export function increment(n) {
  return { _sentinel: "increment", value: n };
}

export function arrayUnion(...items) {
  return { _sentinel: "arrayUnion", value: items };
}

export function query(collRef, ...rest) {
  const q = { _type: "query", collection: collRef.name || collRef, filters: [], sorts: [], limitCount: 999999 };
  for (const r of rest) {
    if (r._type === "where") q.filters.push(r);
    else if (r._type === "orderBy") q.sorts.push(r);
    else if (r._type === "limit") q.limitCount = r.value;
  }
  return q;
}

export function where(field, op, val) {
  return { _type: "where", field, op, val };
}

export function orderBy(field, dir = "asc") {
  return { _type: "orderBy", field, dir };
}

export function limit(n) {
  return { _type: "limit", value: n };
}

export function writeBatch(dbInst) {
  const ops = [];
  return {
    set: (ref, data) => ops.push({ type: "set", ref, data }),
    update: (ref, data) => ops.push({ type: "update", ref, data }),
    delete: (ref) => ops.push({ type: "delete", ref }),
    commit: async () => {
      for (const op of ops) {
        if (op.type === "set") await setDoc(op.ref, op.data);
        else if (op.type === "update") await updateDoc(op.ref, op.data);
        else if (op.type === "delete") await deleteDoc(op.ref);
      }
    },
  };
}

function getNested(obj, path) {
  if (!obj || !path) return undefined;
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

// ─── Restore session on page load ───
(function init() {
  const saved = getSession();
  if (saved && saved.uid) {
    const userData = getUser(saved.uid);
    if (userData) {
      localAuth.currentUser = {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName || "",
        plan: userData.plan,
        planExpiry: userData.planExpiry,
        role: userData.role || "user",
      };
      // Notify any listener that was already registered
      setTimeout(() => notifyAuthState(localAuth.currentUser), 0);
    } else {
      clearSession();
    }
  }
})();

export const app = {};
export const googleProvider = null;
export const analytics = null;
export const isFirebaseConfigured = true;
