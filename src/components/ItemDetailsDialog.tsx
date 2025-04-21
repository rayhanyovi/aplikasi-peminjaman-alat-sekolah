import { useEffect, useState } from "react";
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
  Skeleton,
  TextField,
} from "@mui/material";
import dayjs from "dayjs";
import { fetchHistory, updateItem } from "@/lib/handler/itemHandler";

interface HistoryEntry {
  id: number;
  borrower: string;
  student_id: string;
  approved_at: string;
  return_note: string | null;
  returned_at?: string;
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

interface ItemDetailsDialogProps {
  open: boolean;
  item: Item | null;
  onClose: () => void;
}

export default function ItemDetailsDialog({
  open,
  item,
  onClose,
}: ItemDetailsDialogProps) {
  const [loading, setLoading] = useState(true);
  const [histories, setHistories] = useState<HistoryEntry[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleEditSubmit = async (itemId: number) => {
    await updateItem(itemId, {
      name: name,
      code: code,
      image: imageUrl,
      status: "tersedia",
    });
    setEditMode(false);
  };

  useEffect(() => {
    console.log("wadidaw");
  }, [open]);

  // Di ItemDetailsDialog:
  useEffect(() => {
    if (open && item) {
      setName(item.name);
      setCode(item.code);
      setImageUrl(item.image);

      const fetchHistories = async () => {
        try {
          const response = await fetchHistory(item.id);
          setHistories(response);
          setLoading(false);
        } catch (err) {
          console.error("Failed to fetch histories:", err);
        }
      };

      fetchHistories();
    } else {
      // Reset state ketika dialog ditutup
      setHistories([]);
      setLoading(true);
    }
  }, [open, item]); // Pastikan dependency array termasuk item

  const handleClose = () => {
    onClose();
    setHistories([]);
  };

  if (!item) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          backgroundColor: "background.paper", // atau 'white'
          boxShadow: 24,
          borderRadius: 2,
        },
      }}
    >
      {item && (
        <>
          <DialogTitle
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            Detail Barang
            {!editMode ? (
              <Button onClick={() => setEditMode(true)}>Edit</Button>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button
                  onClick={() => handleEditSubmit(item.id)}
                  variant="contained"
                  size="small"
                >
                  Simpan
                </Button>
                <Button
                  onClick={() => {
                    setEditMode(false);
                    setName(item.name);
                    setCode(item.code);
                    setImageUrl(item.image);
                  }}
                  size="small"
                >
                  Batal
                </Button>
              </Stack>
            )}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2}>
                <Avatar
                  variant="rounded"
                  src={item.image}
                  sx={{ width: 80, height: 80 }}
                />
                <Box>
                  {editMode ? (
                    <Stack spacing={2}>
                      <TextField
                        label="Nama Barang"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <TextField
                        label="Kode Barang"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                      />
                      <TextField
                        label="URL Gambar"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                    </Stack>
                  ) : (
                    <>
                      <Typography variant="h6">{item.name}</Typography>
                      <Typography variant="body2">Kode: {item.code}</Typography>
                      <Typography variant="body2">
                        Status: {item.status}
                      </Typography>
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
                    </>
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

                {loading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: "20px",
                    }}
                  >
                    <Skeleton variant="rectangular" width="100%" height={50} />
                    <Skeleton variant="rectangular" width="100%" height={50} />
                    <Skeleton variant="rectangular" width="100%" height={50} />
                    <Skeleton variant="rectangular" width="100%" height={50} />
                  </Box>
                ) : histories && histories.length > 0 ? (
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
                      {histories
                        .sort(
                          (a, b) =>
                            new Date(b.approved_at).getTime() -
                            new Date(a.approved_at).getTime()
                        )
                        .map((entry: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>{entry.borrower}</TableCell>
                            <TableCell className="whitespace-pre-line">
                              {dayjs(entry.approved_at).format(
                                "dddd, \n DD/MM/YYYY"
                              )}
                            </TableCell>
                            <TableCell className="whitespace-pre-line">
                              {entry.returned_at
                                ? dayjs(entry.returned_at).format(
                                    "dddd, \n DD/MM/YYYY"
                                  )
                                : "-"}
                            </TableCell>
                            <TableCell>{entry.return_note || "-"}</TableCell>
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
