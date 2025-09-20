// src/utils/imageProcessing.js
const MAX_FILE_SIZE_KB = 1024;
const MAX_DIMENSION = 1200;

export const processImageFile = async (file, onProgress) => {
  if (file.size / 1024 <= MAX_FILE_SIZE_KB) return file;

  onProgress(30);
  const resizedImage = await resizeImage(file, MAX_DIMENSION, MAX_DIMENSION);

  onProgress(60);
  const compressedImage = await compressToFileSize(
    resizedImage,
    MAX_FILE_SIZE_KB
  );

  onProgress(100);
  return compressedImage;
};

export const resizeImage = (file, maxWidth, maxHeight) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Falha ao criar blob"));
          resolve(
            new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            })
          );
        },
        "image/jpeg",
        0.9
      );
    };
    img.onerror = () => reject(new Error("Falha ao carregar imagem"));
    img.src = URL.createObjectURL(file);
  });
};

export const compressToFileSize = (file, maxSizeKB) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        let quality = 0.9;
        const compress = () => {
          canvas.toBlob(
            (blob) => {
              if (blob.size / 1024 <= maxSizeKB || quality <= 0.1) {
                resolve(
                  new File([blob], file.name, {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                  })
                );
              } else {
                quality -= 0.1;
                compress();
              }
            },
            "image/jpeg",
            quality
          );
        };
        compress();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) =>
      reject(new Error("Falha ao converter para Base64"));
    reader.readAsDataURL(file);
  });
};
