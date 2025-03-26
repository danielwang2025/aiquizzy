
// Modify the isQuestionDisputed call to handle it properly:
const checkIfDisputed = async () => {
  try {
    const disputed = await isQuestionDisputed(question.id);
    setIsAlreadyDisputed(disputed);
  } catch (error) {
    console.error("Error checking if question is disputed:", error);
  }
};
