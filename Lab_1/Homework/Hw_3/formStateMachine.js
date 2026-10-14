/**
 * @param {Object} formData
 * @returns {Promise}
 */
export async function submitEventData(formData) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (formData.eventTitle.toLowerCase() === "fail") {
        reject(new Error("Server rejected the event submission."));
      } else {
        resolve({ success: true, message: "Event successfully registered!" });
      }
    }, 1200);
  });
}
