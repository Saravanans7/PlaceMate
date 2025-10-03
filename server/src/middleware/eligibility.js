export function eligibilityMiddleware(getRegistration) {
  return async (req, res, next) => {
    try {
      const registration = await getRegistration(req);
      if (!registration) return res.status(404).json({ success: false, message: 'Registration not found' });
      const e = registration.eligibility || {};
      const s = req.user;
      if (e.minCgpa != null && (s.cgpa ?? 0) < e.minCgpa) return res.status(400).json({ success: false, message: 'Not eligible: CGPA' });
      if (e.maxArrears != null && (s.arrears ?? 0) > e.maxArrears) return res.status(400).json({ success: false, message: 'Not eligible: arrears' });
      if (e.maxHistoryArrears != null && (s.historyOfArrears ?? 0) > e.maxHistoryArrears) return res.status(400).json({ success: false, message: 'Not eligible: history of arrears' });
      if (e.minTenthPercent != null && (s.tenthPercent ?? 0) < e.minTenthPercent) return res.status(400).json({ success: false, message: 'Not eligible: 10th %' });
      if (e.minTwelfthPercent != null && (s.twelfthPercent ?? 0) < e.minTwelfthPercent) return res.status(400).json({ success: false, message: 'Not eligible: 12th %' });
      if (Array.isArray(e.acceptedBatches) && e.acceptedBatches.length > 0 && !e.acceptedBatches.includes(s.batch)) return res.status(400).json({ success: false, message: 'Not eligible: batch' });
      req.registration = registration;
      next();
    } catch (err) {
      next(err);
    }
  };
}


