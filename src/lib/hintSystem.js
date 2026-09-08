const MAX_HINTS = 5;

function getHintsUsed(examId, userId) {
  try {
    const key = `ep_hints_${examId}_${userId}`;
    return parseInt(localStorage.getItem(key) || "0", 10);
  } catch {
    return 0;
  }
}

function useHint(examId, userId) {
  const used = getHintsUsed(examId, userId);
  if (used >= MAX_HINTS) {
    return { used, remaining: 0, canUse: false };
  }

  const newUsed = used + 1;
  localStorage.setItem(`ep_hints_${examId}_${userId}`, newUsed.toString());

  return { used: newUsed, remaining: MAX_HINTS - newUsed, canUse: true };
}

function canUseHint(examId, userId) {
  return getHintsUsed(examId, userId) < MAX_HINTS;
}

function requestFriendHelp(userId, userName, subject, examId) {
  const origin = window.location.origin;
  const message =
    `Hey! I need help with ${subject} on ExamPadi AI. Can you assist me?\n\n` +
    `Exam: ${examId}\n` +
    `Click to help: ${origin}/help-request?exam=${examId}&from=${userId}`;

  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/?text=${encoded}`, "_blank");

  const key = `ep_friend_request_${examId}`;
  localStorage.setItem(
    key,
    JSON.stringify({ requested: true, friendName: userName, accepted: false })
  );
}

function getFriendRequest(examId) {
  try {
    const key = `ep_friend_request_${examId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function respondToHelp(examId, friendUid, friendName, accepted) {
  const key = `ep_friend_response_${examId}_${friendUid}`;
  localStorage.setItem(
    key,
    JSON.stringify({ friendName, accepted, timestamp: Date.now() })
  );
}

function getHelpStatus(examId) {
  try {
    const requestKey = `ep_friend_request_${examId}`;
    const raw = localStorage.getItem(requestKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      requested: parsed.requested,
      friendName: parsed.friendName,
      accepted: parsed.accepted,
    };
  } catch {
    return null;
  }
}

export {
  MAX_HINTS,
  getHintsUsed,
  useHint,
  canUseHint,
  requestFriendHelp,
  getFriendRequest,
  respondToHelp,
  getHelpStatus,
};
