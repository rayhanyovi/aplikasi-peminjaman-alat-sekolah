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

export default function ItemManagementPage() {
  const { user } = useUserContext();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [itemDetailsDialog, setItemDetailsDialog] = useState(false);
  const [openReturnDialog, setOpenReturnDialog] = useState(false);
  const [openAddItemDialog, setOpenAddItemDialog] = useState(false);
  const [openEditItemDialog, setOpenEditItemDialog] = useState(false);
  const [itemToReturn, setItemToReturn] = useState<any>(null);

  useEffect(() => {
    const fetchAllItems = async () => {
      const response = await fetchItems();
      setItems(response);
      setLoading(false); // Set loading selesai setelah data tersedia
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

  const handleOpenItemDetailsDialog = (item: Item) => {
    setSelectedItem(item);
    setItemDetailsDialog(true);
  };

  const handleCloseItemDetailsDialog = () => {
    setItemDetailsDialog(false);
    setSelectedItem(null);
  };

  const handleEditItem = async (values: ItemFormValues) => {
    try {
      await updateItem(selectedItem.id, { ...values, status: "tersedia" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = async (values: ItemFormValues) => {
    try {
      await addItem({ ...values, status: "tersedia" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleReturnSubmit = (itemId: number, returnNote: string) => {
    // TODO: Kirim data ke backend di sini
    console.log("Barang ID:", itemId);
    console.log("Catatan pengembalian:", returnNote);
    handleCloseReturnDialog();
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
          <p onClick={() => console.log(user)}>xx</p>
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
              <TableCell>Dipinjam Oleh</TableCell>
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
                      item.status === "dipinjam" ? "error.main" : "success.main"
                    }
                    fontWeight={500}
                  >
                    {item.status}
                  </Typography>
                </TableCell>
                <TableCell>{item.borrowedBy || "-"}</TableCell>
                <TableCell>
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
                      <ItemDetailsDialog
                        open={itemDetailsDialog}
                        item={selectedItem}
                        onClose={handleCloseItemDetailsDialog}
                        onSubmit={handleReturnSubmit}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        className="w-full"
                        onClick={() => {
                          setOpenEditItemDialog(true);
                          setSelectedItem(item);
                        }}
                      >
                        Edit
                      </Button>
                      <AddItemDialog
                        isEditMode
                        open={openEditItemDialog}
                        initialData={item}
                        onClose={() => setOpenEditItemDialog(false)}
                        onSubmit={handleEditItem}
                      />
                    </Stack>
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
                    <ReturnDialog
                      open={openReturnDialog}
                      item={itemToReturn}
                      onClose={handleCloseReturnDialog}
                      onSubmit={handleReturnSubmit}
                    />
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
