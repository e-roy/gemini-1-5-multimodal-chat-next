export const convertFileToBase64 = async (
  file: File
): Promise<{ base64: string; fileUrl: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1];
      resolve({ base64: base64String, fileUrl: reader.result as string });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
