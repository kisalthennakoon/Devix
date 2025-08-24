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
} from "@mui/material";
import { useState } from "react";

// Interface for a transformer
export interface TransformerDetails {
  no: string;
  pole: string;
  region: string;
  type: "Bulk" | "Distribution";
}

// Props type
type TransformerTableProps = {
  transformers: TransformerDetails[];
};

function TransformerTable({ transformers }: TransformerTableProps) {
  const [view, setView] = useState<"transformers" | "inspections">(
    "transformers"
  );

  // Filter states
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState<"no" | "pole" | "region" | "type">(
    "no"
  );
  const [regionFilter, setRegionFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Dialog states
  const [open, setOpen] = useState(false);
  const [newTransformer, setNewTransformer] = useState({
    region: "",
    no: "",
    pole: "",
    type: "",
    location: "",
  });

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: "transformers" | "inspections" | null
  ) => {
    if (newView !== null) setView(newView);
  };

  // Filtered transformers
  const filteredTransformers = transformers.filter((t) => {
    const searchValue = search.toLowerCase().trim();

    let matchesSearch = true;
    if (searchValue) {
      if (searchBy === "no")
        matchesSearch = t.no.toLowerCase().includes(searchValue);
      if (searchBy === "pole")
        matchesSearch = t.pole.toLowerCase().includes(searchValue);
      if (searchBy === "region")
        matchesSearch = t.region.toLowerCase().includes(searchValue);
      if (searchBy === "type")
        matchesSearch = t.type.toLowerCase().includes(searchValue);
    }

    const matchesRegion = regionFilter === "" || t.region === regionFilter;
    const matchesType = typeFilter === "" || t.type === typeFilter;

    return matchesSearch && matchesRegion && matchesType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTransformers.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const currentTransformers = filteredTransformers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Typography variant="h5">Transformers</Typography>
          <Button
            variant="contained"
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "secondary.main" },
            }}
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
      <Box
        sx={{ border: "1px solid #ddd", borderRadius: 2, overflow: "hidden" }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            bgcolor: "primary.main",
            color: "white",
            p: 1,
            fontWeight: "bold",
          }}
        >
          <Box sx={{ flex: 1 }}>Transformer No.</Box>
          <Box sx={{ flex: 1 }}>Pole No.</Box>
          <Box sx={{ flex: 1 }}>Region</Box>
          <Box sx={{ flex: 1 }}>Type</Box>
          <Box sx={{ width: 100 }}>Actions</Box>
        </Box>

        {/* Rows */}
        {currentTransformers.map((t) => (
          <Box
            key={t.no}
            sx={{
              display: "flex",
              alignItems: "center",
              p: 1,
              borderBottom: "1px solid #eee",
              "&:hover": { bgcolor: "#f5f5f5" },
            }}
          >
            <Box sx={{ flex: 1 }}>{t.no}</Box>
            <Box sx={{ flex: 1 }}>{t.pole}</Box>
            <Box sx={{ flex: 1 }}>{t.region}</Box>
            <Box sx={{ flex: 1 }}>{t.type}</Box>
            <Box sx={{ width: 100 }}>
              <Button variant="contained" size="small">
                View
              </Button>
            </Box>
          </Box>
        ))}
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
            value={newTransformer.region}
            onChange={(e) =>
              setNewTransformer({ ...newTransformer, region: e.target.value })
            }
            displayEmpty
          >
            <MenuItem value="">Select Region</MenuItem>
            <MenuItem value="Nugegoda">Nugegoda</MenuItem>
            <MenuItem value="Maharagama">Maharagama</MenuItem>
          </Select>

          <TextField
            label="Transformer No"
            value={newTransformer.no}
            onChange={(e) =>
              setNewTransformer({ ...newTransformer, no: e.target.value })
            }
          />
          <TextField
            label="Pole No"
            value={newTransformer.pole}
            onChange={(e) =>
              setNewTransformer({ ...newTransformer, pole: e.target.value })
            }
          />

          <Select
            value={newTransformer.type}
            onChange={(e) =>
              setNewTransformer({ ...newTransformer, type: e.target.value })
            }
            displayEmpty
          >
            <MenuItem value="">Select Type</MenuItem>
            <MenuItem value="Bulk">Bulk</MenuItem>
            <MenuItem value="Distribution">Distribution</MenuItem>
          </Select>

          <TextField
            label="Location Details"
            value={newTransformer.location}
            onChange={(e) =>
              setNewTransformer({ ...newTransformer, location: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              console.log("Transformer Added:", newTransformer);
              setOpen(false);
            }}
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TransformerTable;
