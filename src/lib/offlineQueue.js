let pending = [];

function getFirestore() {
  const { db } = require('../firebase');
  return db;
}

export function queueFirestoreWrite(path, data) {
  if (navigator.onLine) {
    const { doc, setDoc } = require('firebase/firestore');
    try {
      setDoc(doc(getFirestore(), path), data);
      return;
    } catch (e) {
      console.warn('Firestore write failed, queueing:', e);
    }
  }
  pending.push({ path, data, timestamp: Date.now() });
  localStorage.setItem('exampadi_offline_queue', JSON.stringify(pending));
}

export function queueFirestoreAdd(collectionPath, data) {
  if (navigator.onLine) {
    const { collection, addDoc } = require('firebase/firestore');
    try {
      addDoc(collection(getFirestore(), collectionPath), data);
      return;
    } catch (e) {
      console.warn('Firestore add failed, queueing:', e);
    }
  }
  pending.push({ collectionPath, data, timestamp: Date.now(), isAdd: true });
  localStorage.setItem('exampadi_offline_queue', JSON.stringify(pending));
}

export function flushQueue() {
  if (pending.length === 0) {
    const saved = localStorage.getItem('exampadi_offline_queue');
    if (saved) {
      try { pending = JSON.parse(saved); } catch { pending = []; }
    }
  }
  if (!navigator.onLine || pending.length === 0) return;

  const { doc, setDoc, collection, addDoc } = require('firebase/firestore');
  const db = getFirestore();
  const failed = [];

  pending.forEach(op => {
    try {
      if (op.isAdd) {
        addDoc(collection(db, op.collectionPath), op.data);
      } else {
        setDoc(doc(db, op.path), op.data);
      }
    } catch {
      failed.push(op);
    }
  });

  pending = failed;
  localStorage.setItem('exampadi_offline_queue', JSON.stringify(pending));
}

// Auto-flush when back online
window.addEventListener('online', flushQueue);

// Load pending from localStorage on init
(function load() {
  const saved = localStorage.getItem('exampadi_offline_queue');
  if (saved) {
    try { pending = JSON.parse(saved); } catch { pending = []; }
  }
})();
