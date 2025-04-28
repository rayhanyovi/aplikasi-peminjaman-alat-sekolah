import Papa from "papaparse";

export const handleCsvUpload = (file: any) => {
  const reader = new FileReader();

  return new Promise<any[]>((resolve, reject) => {
    reader.onload = () => {
      const csvData = reader.result as string;
      console.log("CSV data loaded:", csvData); // Debugging log to show the raw CSV data

      Papa.parse(csvData, {
        complete: (result) => {
          console.log("Parsed result:", result); // Log the result after parsing

          const users = result.data.map((item: any) => ({
            email: item.email,
            role: item.role,
            name: item.name,
          }));

          console.log("Mapped users:", users); // Log the final users data

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
