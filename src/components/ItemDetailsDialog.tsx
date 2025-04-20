import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Typography,
  Box,
  Button,
  Avatar,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import dayjs from "dayjs";

interface HistoryEntry {
  borrower: string;
  borrowedDate: string;
  returnedDate: string | null;
  note: string;
  returnNote?: string;
}

interface Item {
  id: number;
  name: string;
  code: string;
  image: string;
  note: string;
  status: string;
  borrowedBy: string | null;
  history: HistoryEntry[];
}

interface ReturnDialogProps {
  open: boolean;
  item: Item | null;
  onClose: () => void;
  onSubmit: (itemId: number, returnNote: string) => void;
}

export default function ItemDetailsDialog({
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      {item && (
        <>
          <DialogTitle>Detail Barang</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2}>
                <Avatar
                  variant="rounded"
                  src={item.image}
                  sx={{ width: 80, height: 80 }}
                />
                <Box>
                  <Typography variant="h6">{item.name}</Typography>
                  <Typography variant="body2">Kode: {item.code}</Typography>
                  <Typography variant="body2">Status: {item.status}</Typography>
                  {item.borrowedBy && (
                    <Typography variant="body2">
                      Dipinjam oleh: {item.borrowedBy}
                    </Typography>
                  )}
                  {item.note && (
                    <Typography variant="body2" mt={1}>
                      Catatan: {item.note}
                    </Typography>
                  )}
                </Box>
              </Stack>

              <Box mt={2}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Riwayat Peminjaman
                </Typography>
                {item.history && item.history.length > 0 ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Peminjam</TableCell>
                        <TableCell>Tgl Pinjam</TableCell>
                        <TableCell>Tgl Kembali</TableCell>
                        <TableCell>Catatan</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {item.history
                        .sort(
                          (a, b) =>
                            new Date(b.borrowedDate).getTime() -
                            new Date(a.borrowedDate).getTime()
                        )
                        .map((entry: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>{entry.borrower}</TableCell>
                            <TableCell className="whitespace-pre-line">
                              {dayjs(entry.borrowedDate).format(
                                "dddd, \n DD/MM/YYYY"
                              )}
                            </TableCell>
                            <TableCell className="whitespace-pre-line">
                              {entry.returnedDate
                                ? dayjs(entry.returnedDate).format(
                                    "dddd, \n DD/MM/YYYY"
                                  )
                                : "-"}
                            </TableCell>
                            <TableCell>{entry.note || "-"}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography variant="body2" mt={1} color="text.secondary">
                    Belum ada riwayat peminjaman.
                  </Typography>
                )}
              </Box>
            </Stack>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}
