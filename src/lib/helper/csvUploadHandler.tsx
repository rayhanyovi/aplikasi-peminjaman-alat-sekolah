import Papa from "papaparse";

export const handleCsvUpload = (file: any) => {
  const reader = new FileReader();

  return new Promise<any[]>((resolve, reject) => {
    reader.onload = () => {
      const csvData = reader.result as string;

      Papa.parse(csvData, {
        complete: (result) => {
          const users = result.data.map((item: any) => ({
            email: item.email,
            role: item.role,
            name: item.name,
          }));

          resolve(users);
        },
        header: true, // Untuk memastikan header digunakan sebagai key
        skipEmptyLines: true, // Menghindari baris kosong
      });
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error); // Log the error if the file fails to read
      reject("Gagal membaca file!");
    };

    reader.readAsText(file);
  });
};
