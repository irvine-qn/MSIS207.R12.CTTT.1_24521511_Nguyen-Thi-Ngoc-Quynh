/**
 * Mock API call. A title of "fail" simulates a server error.
 * @param {{ eventTitle: string, eventDescription: string }} formData
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export function submitEventData(formData) {
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
