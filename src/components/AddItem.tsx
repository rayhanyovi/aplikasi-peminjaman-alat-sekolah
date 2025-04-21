import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { useState, useEffect } from "react";

interface ItemFormDialogProps {
  isEditMode?: boolean;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ItemFormValues) => void;
  initialData?: ItemFormValues | null;
}

export interface ItemFormValues {
  name: string;
  code: string;
  image: string;
}

export default function AddItemDialog({
  isEditMode = false,
  open,
  onClose,
  onSubmit,
  initialData,
}: ItemFormDialogProps) {
  const [formValues, setFormValues] = useState<ItemFormValues>({
    name: "",
    code: "",
    image: "",
  });

  useEffect(() => {
    if (initialData && isEditMode) {
      setFormValues({
        name: initialData.name,
        code: initialData.code,
        image: initialData.image,
      });
    } else {
      setFormValues({
        name: "",
        code: "",
        image: "",
      });
    }
  }, [initialData, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formValues);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? "Edit Item" : "Tambah Item"}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Nama"
              name="name"
              fullWidth
              required
              value={formValues.name}
              onChange={handleChange}
            />
            <TextField
              label="Kode"
              name="code"
              fullWidth
              required
              value={formValues.code}
              onChange={handleChange}
            />
            <TextField
              label="URL Gambar"
              name="image"
              fullWidth
              value={formValues.image}
              onChange={handleChange}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Batal</Button>
          <Button type="submit" variant="contained">
            {initialData ? "Simpan" : "Tambah"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
