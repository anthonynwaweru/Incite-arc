const generateMessageandTimestamp = (text) => {
  return {
    text,
    createdAt: new Date().getTime(),
  };
};

module.exports = {
  generateMessageandTimestamp,
};
