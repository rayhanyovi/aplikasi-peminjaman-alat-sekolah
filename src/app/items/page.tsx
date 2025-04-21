"use client";

import { use, useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
} from "@mui/material";
import ItemDetailsDialog from "@/components/ItemDetailsDialog";
import ReturnDialog from "@/components/ReturnDialog";
import AddItemDialog, { ItemFormValues } from "@/components/AddItem";
import { Item } from "@/types/itemTypes";
import { addItem, fetchItems, updateItem } from "@/lib/handler/itemHandler";
import { useUserContext } from "@/context/userContext";
import {
  ApproveLoan,
  RejectLoan,
  RequestLoan,
  ReturnLoan,
} from "@/lib/handler/loanHandler";
import LoanRejectionDialog from "@/components/LoanRejectionDialog";

export default function ItemManagementPage() {
  const { user } = useUserContext();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [itemDetailsDialog, setItemDetailsDialog] = useState(false);
  const [openReturnDialog, setOpenReturnDialog] = useState(false);
  const [openRejectLoanDialog, setOpenRejectLoanDialog] = useState(false);
  const [openAddItemDialog, setOpenAddItemDialog] = useState(false);
  const [itemToReturn, setItemToReturn] = useState<any>(null);

  useEffect(() => {
    const fetchAllItems = async () => {
      const response = await fetchItems();
      setItems(response);
      setLoading(false);
    };

    fetchAllItems();
  }, []);

  const handleOpenReturnDialog = (item: Item) => {
    setItemToReturn(item);
    setOpenReturnDialog(true);
  };

  const handleCloseReturnDialog = () => {
    setOpenReturnDialog(false);
    setItemToReturn(null);
  };

  const handleCloseRejectionDialog = () => {
    setOpenRejectLoanDialog(false);
    setItemToReturn(null);
  };

  const handleOpenItemDetailsDialog = (item: Item) => {
    setSelectedItem(item);
    setItemDetailsDialog(true);
  };

  const handleCloseItemDetailsDialog = () => {
    setSelectedItem(null);
    setItemDetailsDialog(false);
  };

  const handleAddItem = async (values: ItemFormValues) => {
    try {
      await addItem({ ...values, status: "tersedia" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleReturnSubmit = async (itemId: number, returnNote: string) => {
    try {
      const response = await ReturnLoan({
        itemId: itemId,
        returnNote: returnNote,
      });
      if (response.success) {
        setItems(
          items.map((item) => {
            if (item.id === itemId) {
              return {
                ...item,
                status: "tersedia",
                borrowed_by: null,
              };
            } else {
              return item;
            }
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    handleCloseReturnDialog();
  };

  const handleApproveSubmit = async (itemId: number) => {
    try {
      const response = await ApproveLoan({ itemId: itemId });
      if (response.success) {
        setItems(
          items.map((item) => {
            if (item.id === itemId) {
              return {
                ...item,
                status: "dipinjam",
                borrowedBy: response.borrower.name,
              };
            } else {
              return item;
            }
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectionSubmit = async (
    itemId: number,
    rejectionNote: string
  ) => {
    const response = await RejectLoan({
      itemId: itemId,
      rejectionNote: rejectionNote,
    });

    setOpenRejectLoanDialog(false);
  };
  if (loading) {
    return (
      <div className="w-full h-dvh flex items-center justify-center">
        <p>Memuat Halaman</p>
      </div>
    );
  }

  return (
    <Box p={4}>
      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Manajemen Barangx {user?.role}
        </Typography>
        <Button variant="contained" onClick={() => setOpenAddItemDialog(true)}>
          Tambah Barang
        </Button>
        <AddItemDialog
          open={openAddItemDialog}
          onClose={() => setOpenAddItemDialog(false)}
          onSubmit={handleAddItem}
        />
      </Box>
      <Box mt={3}>
        <Table className="shadow border-gray-200 border">
          <TableHead>
            <TableRow>
              <TableCell>Foto</TableCell>
              <TableCell>Nama</TableCell>
              <TableCell>Kode</TableCell>
              <TableCell>Status</TableCell>
              {user?.role !== "siswa" && <TableCell>Dipinjam Oleh</TableCell>}
              <TableCell>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Avatar
                    variant="rounded"
                    src={item.image}
                    sx={{ width: 60, height: 60 }}
                  />
                </TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.code}</TableCell>
                <TableCell>
                  <Typography
                    color={
                      item.status === "dipinjam"
                        ? "error.main"
                        : item.status === "pending"
                        ? "warning.main"
                        : "success.main"
                    }
                    fontWeight={500}
                  >
                    {item.status}
                  </Typography>
                </TableCell>
                {user?.role !== "siswa" && (
                  <TableCell>{item.borrowed_by?.name || "-"}</TableCell>
                )}
                <TableCell>
                  {user?.role !== "siswa" ? (
                    <Stack direction="column" spacing={1}>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          className="w-full"
                          onClick={() => handleOpenItemDetailsDialog(item)}
                        >
                          Detail
                        </Button>
                      </Stack>
                      {item.status === "pending" && (
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            className="w-full"
                            onClick={() => handleApproveSubmit(item.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            className="w-full"
                            onClick={() => {
                              setSelectedItem(item);
                              setOpenRejectLoanDialog(true);
                            }}
                          >
                            Reject
                          </Button>
                        </Stack>
                      )}

                      {item.status === "dipinjam" && (
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() => handleOpenReturnDialog(item)}
                        >
                          Pengembalian
                        </Button>
                      )}
                    </Stack>
                  ) : (
                    <>
                      {item.status !== "dipinjam" && (
                        <Button
                          variant="contained"
                          size="small"
                          color="success"
                          disabled={item.status === "pending"}
                          onClick={() => RequestLoan({ itemId: item.id })}
                        >
                          {item.status === "pending"
                            ? "Menunggu Approval"
                            : "Ajukan Peminjaman"}
                        </Button>
                      )}
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <LoanRejectionDialog
        open={openRejectLoanDialog}
        item={selectedItem}
        onClose={handleCloseRejectionDialog}
        onSubmit={handleRejectionSubmit}
      />
      <ItemDetailsDialog
        open={itemDetailsDialog}
        item={selectedItem}
        onClose={handleCloseItemDetailsDialog}
      />

      <ReturnDialog
        open={openReturnDialog}
        item={itemToReturn}
        onClose={handleCloseReturnDialog}
        onSubmit={handleReturnSubmit}
      />
    </Box>
  );
}
