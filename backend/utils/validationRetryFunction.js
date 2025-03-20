const retryWithDelay = async (fn, retries = 3, delay = 5000) => {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return retryWithDelay(fn, retries - 1, delay);
      } else {
        throw error;
      }
    }
  };

  export default retryWithDelay