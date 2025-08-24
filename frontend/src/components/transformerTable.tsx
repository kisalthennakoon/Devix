import {
  Typography,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";

// Interface for a transformer
export interface TransformerDetails {
  transformerNo: string;
  transformerPoleNo: string;
  transformerRegion: string;
  transformerType: "string";
  transformerLocation: "string"
}

// Props type
type TransformerTableProps = {
  //transformers: TransformerDetails[];
  onView?: (t: TransformerDetails) => void;
};

function TransformerTable({ onView }: TransformerTableProps) {
  const [view, setView] = useState<"transformers" | "inspections">("transformers");

  // Filter states
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState<"no" | "pole" | "region" | "type">("no");
  const [regionFilter, setRegionFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [transformersData, setTransformersData] = useState<TransformerDetails[]>([]);

useEffect(() => {
  axios.get("/api/transformer/getAll")
    .then((res) => setTransformersData(res.data))
    .catch((err) => console.error("Failed to fetch transformers:", err));
}, []);

  // Pagination states
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;



  // Dialog states
  const [open, setOpen] = useState(false);
  const [newTransformer, setNewTransformer] = useState({
    transformerNo: "",
    transformerPoleNo: "",
    transformerRegion: "",
    transformerLocation: "",
    transformerType: "",
  });

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const [formError, setFormError] = useState<string | null>(null);
  const onClickConfirm = async () => {
  // Trim and validate all fields
  if (
    !newTransformer.transformerNo.trim() ||
    !newTransformer.transformerPoleNo.trim() ||
    !newTransformer.transformerRegion.trim() ||
    !newTransformer.transformerLocation.trim() ||
    !newTransformer.transformerType.trim()
  ) {
    setFormError("All fields are required.");
    return;
  }
  setFormError(null);
  try {
      const res = await axios.post(
        "/api/transformer/create",
        newTransformer
      );
      setOpen(false);
      setSnackbar({
        open: true,
        message: res.data?.message || "Transformer successfully created.",
        severity: "success",
      });
    // Refresh the transformer list
    const getRes = await axios.get("/api/transformer/getAll");
    setTransformersData(getRes.data);
    // Reset form
    setNewTransformer({
      transformerNo: "",
      transformerPoleNo: "",
      transformerRegion: "",
      transformerLocation: "",
      transformerType: "",
    });
  } catch (err) {
    // Handles both string and object error responses
    let errorMsg = "Failed to add transformer. Please try again.";
    if (err?.response?.data) {
      if (typeof err.response.data === "string") {
        errorMsg = err.response.data;
      } else if (typeof err.response.data.message === "string") {
        errorMsg = err.response.data.message;
      }
    }
    setSnackbar({
        open: true,
        message: errorMsg,
        severity: "error",
    });
  }
};



  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: "transformers" | "inspections" | null
  ) => {
    if (newView !== null) setView(newView);
  };

  // Filtered transformers
  const filteredTransformers = transformersData.filter((t) => {
    const searchValue = search.toLowerCase().trim();

    let matchesSearch = true;
    if (searchValue) {
      if (searchBy === "no") matchesSearch = t.transformerNo.toLowerCase().includes(searchValue);
      if (searchBy === "pole") matchesSearch = t.transformerPoleNo.toLowerCase().includes(searchValue);
      if (searchBy === "region") matchesSearch = t.transformerRegion.toLowerCase().includes(searchValue);
      if (searchBy === "type") matchesSearch = t.transformerType.toLowerCase().includes(searchValue);
    }

    const matchesRegion = regionFilter === "" || t.transformerRegion === regionFilter;
    const matchesType = typeFilter === "" || t.transformerType === typeFilter;

    return matchesSearch && matchesRegion && matchesType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTransformers.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const currentTransformers = filteredTransformers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Typography variant="h5">Transformers</Typography>
          <Button
            variant="contained"
            sx={{ bgcolor: "primary.main", "&:hover": { bgcolor: "secondary.main" } }}
            onClick={() => setOpen(true)}
          >
            Add Transformer
          </Button>
        </Box>

        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          size="small"
          color="primary"
        >
          <ToggleButton value="transformers">Transformers</ToggleButton>
          <ToggleButton value="inspections">Inspections</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <Select
          value={searchBy}
          onChange={(e) => {
            setSearchBy(e.target.value as "no" | "pole" | "region" | "type");
            setSearch("");
          }}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="no">Transformer No.</MenuItem>
          <MenuItem value="pole">Pole No.</MenuItem>
          <MenuItem value="region">Region</MenuItem>
          <MenuItem value="type">Type</MenuItem>
        </Select>

        <TextField
          placeholder={`Search ${searchBy}`}
          sx={{ flex: 1 }}
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // reset page when searching
          }}
        />

        <Select
          sx={{ minWidth: 150 }}
          value={regionFilter}
          onChange={(e) => {
            setRegionFilter(e.target.value);
            setPage(1);
          }}
          displayEmpty
        >
          <MenuItem value="">All Regions</MenuItem>
          <MenuItem value="Nugegoda">Nugegoda</MenuItem>
          <MenuItem value="Maharagama">Maharagama</MenuItem>
        </Select>
        
        <Select
          sx={{ minWidth: 150 }}
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          displayEmpty
        >
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="Bulk">Bulk</MenuItem>
          <MenuItem value="Distribution">Distribution</MenuItem>
        </Select>

        <Button
          sx={{ color: "primary.main" }}
          onClick={() => {
            setSearch("");
            setSearchBy("no");
            setRegionFilter("");
            setTypeFilter("");
            setPage(1);
          }}
        >
          Reset Filters
        </Button>
      </Box>

      {/* Table */}
      <Box sx={{ border: "1px solid #ddd", borderRadius: 2, overflow: "hidden" }}>
        {/* Header */}
        <Box sx={{ display: "flex", bgcolor: "primary.main", color: "white", p: 1, fontWeight: "bold" }}>
          <Box sx={{ flex: 1 }}>Transformer No.</Box>
          <Box sx={{ flex: 1 }}>Pole No.</Box>
          <Box sx={{ flex: 1 }}>Region</Box>
          <Box sx={{ flex: 1 }}>Type</Box>
          <Box sx={{ width: 100 }}>Actions</Box>
        </Box>

        {/* Rows */}
        {currentTransformers.length > 0 ? (
          currentTransformers.map((t) => (
            <Box
              key={t.transformerNo}
              sx={{
                display: "flex",
                alignItems: "center",
                p: 1,
                borderBottom: "1px solid #eee",
                "&:hover": { bgcolor: "#f5f5f5" },
              }}
            >
              <Box sx={{ flex: 1 }}>{t.transformerNo}</Box>
              <Box sx={{ flex: 1 }}>{t.transformerPoleNo}</Box>
              <Box sx={{ flex: 1 }}>{t.transformerRegion}</Box>
              <Box sx={{ flex: 1 }}>{t.transformerType}</Box>
              <Box sx={{ width: 100 }}>
                <Button variant="contained" size="small" onClick={() => onView?.(t)}>
                  View
                </Button>
              </Box>
            </Box>
          ))
        ) : (
          <Box sx={{ p: 1, justifyContent: 'center', display: 'flex' }}>No transformers found</Box>
        )}
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 1 }}>
          <Button
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            {"<"}
          </Button>

          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i + 1}
              variant={page === i + 1 ? "contained" : "outlined"}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}

          <Button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          >
            {">"}
          </Button>
        </Box>
      )}
     {/* Add Transformer Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Transformer</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <Select
            value={newTransformer.transformerRegion}
            onChange={(e) =>
              setNewTransformer({ ...newTransformer, transformerRegion: e.target.value })
            }
            displayEmpty
          >
            <MenuItem value="">Select Region</MenuItem>
            <MenuItem value="Nugegoda">Nugegoda</MenuItem>
            <MenuItem value="Maharagama">Maharagama</MenuItem>
          </Select>

          <TextField
            label="Transformer No"
            value={newTransformer.transformerNo}
            onChange={(e) =>
              setNewTransformer({ ...newTransformer, transformerNo: e.target.value })
            }
          />
          <TextField
            label="Pole No"
            value={newTransformer.transformerPoleNo}
            onChange={(e) =>
              setNewTransformer({ ...newTransformer, transformerPoleNo: e.target.value })
            }
          />

          <Select
            value={newTransformer.transformerType}
            onChange={(e) =>
              setNewTransformer({ ...newTransformer, transformerType: e.target.value })
            }
            displayEmpty
          >
            <MenuItem value="">Select Type</MenuItem>
            <MenuItem value="Bulk">Bulk</MenuItem>
            <MenuItem value="Distribution">Distribution</MenuItem>
          </Select>

          <TextField
            label="Location Details"
            value={newTransformer.transformerLocation}
            onChange={(e) =>
              setNewTransformer({ ...newTransformer, transformerLocation: e.target.value })
            }
          />
        </DialogContent>
        {formError && (
          <Typography color="error" sx={{ mt: 1, ml: 2 }}>
            {formError}
          </Typography>
        )}
        <DialogActions>
          <Button onClick={() => { setOpen(false); setFormError(null); }} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              console.log("Transformer Added:", newTransformer);
              onClickConfirm();
            }}
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
        
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );

}

export default TransformerTable;
