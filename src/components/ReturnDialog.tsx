import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Typography,
  Box,
  Button,
} from "@mui/material";
import { Item } from "@/types/itemTypes";

interface ReturnDialogProps {
  open: boolean;
  item: Item | null;
  onClose: () => void;
  onSubmit: (itemId: number, returnNote: string) => void;
}

export default function ReturnDialog({
  open,
  item,
  onClose,
  onSubmit,
}: ReturnDialogProps) {
  const [returnNote, setReturnNote] = useState("");

  if (!item) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(item.id, returnNote);
    setReturnNote("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Pengembalian Barang</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <img
              src={item.image}
              alt={item.name}
              style={{ width: 100, height: 100, borderRadius: 8 }}
            />
            <Box>
              <Typography variant="h6">{item.name}</Typography>
              <Typography>Kode: {item.code}</Typography>
              <Typography>Status: {item.status}</Typography>
              <Typography>
                Dipinjam oleh: <strong>{item.borrowedBy}</strong>
              </Typography>
            </Box>
          </Stack>

          <Box component="form" onSubmit={handleSubmit}>
            <Typography fontWeight="bold">Catatan Pengembalian</Typography>
            <textarea
              style={{
                width: "100%",
                padding: 8,
                marginTop: 4,
                borderRadius: 4,
                border: "1px solid #ccc",
                fontFamily: "inherit",
              }}
              rows={3}
              required
              value={returnNote}
              onChange={(e) => setReturnNote(e.target.value)}
            />

            <Stack direction="row" spacing={2} mt={2}>
              <Button variant="outlined" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Simpan Pengembalian
              </Button>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
