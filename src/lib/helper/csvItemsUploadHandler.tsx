import Papa from "papaparse";

export const handleItemsCsvUpload = (file: any) => {
  const reader = new FileReader();

  return new Promise<any[]>((resolve, reject) => {
    reader.onload = () => {
      const csvData = reader.result as string;

      Papa.parse(csvData, {
        complete: (result) => {
          // Validate required fields
          const items = result.data
            .filter((item: any) => {
              // Skip rows with missing required fields
              if (!item.name || !item.code) {
                console.warn(
                  "Skipping row with missing required fields:",
                  item
                );
                return false;
              }
              return true;
            })
            .map((item: any) => ({
              name: item.name.trim(),
              code: item.code.trim(),
              image: item.image ? item.image.trim() : null, // Optional image URL
            }));

          resolve(items);
        },
        header: true, // Use header as keys
        skipEmptyLines: true, // Skip empty lines
      });
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      reject("Failed to read file!");
    };

    reader.readAsText(file);
  });
};
