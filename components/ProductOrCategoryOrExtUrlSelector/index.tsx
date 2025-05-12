import React, { useState, useRef, useEffect } from "react";
import {
  TextField,
  Typography,
  Backdrop,
  CircularProgress,
  IconButton,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { AmpSDKProps } from "../../lib/models/treeItemData";
import { getProductImage } from "../../lib/product";

type AmpContentType = {
  extId: string;
  extIdType: string;
  text: string;
  image: string;
};

export default function ProductOrCategoryOrExtUrlSelector({
  ampSDK,
}: AmpSDKProps) {
  const [loading, setLoading] = useState(false);
  const selectedBlank: AmpContentType = {
    extId: "",
    extIdType: "",
    text: "",
    image: "",
  };
  const [selected, setSelected] = useState<AmpContentType>(
    ampSDK.getValue() || selectedBlank
  );
  const idInput = useRef<HTMLInputElement>(null);
  const defaultHeight = 310;

  const searchProductById = async () => {
    if (!idInput.current?.value) return;
    setLoading(true);
    ampSDK.clearValue();
    const product = await ampSDK.commerceApi.getProduct({
      id: idInput.current.value,
    });
    if (product) {
      const next: AmpContentType = {
        extId: product.id,
        extIdType: "product",
        text: product.name,
        image: getProductImage(product),
      };
      setSelected(next);
      ampSDK.setValue(next);
    }
    setLoading(false);
  };

  const handleIdKeydown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter") {
      searchProductById();
    } else if (event.key === "Escape") {
      setSelected({ ...selectedBlank, extIdType: "product" });
      ampSDK.clearValue();
    }
  };

  useEffect(() => {
    ampSDK.setHeight(defaultHeight);
  }, [selected.extIdType]);

  return (
    <div>
      <Backdrop
        sx={{
          color: "#77f",
          backgroundColor: "rgba(200,200,200,0.6)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <FormControl size="small" sx={{ minWidth: 180, mt: 2, mb: 2 }}>
        <InputLabel id="type-select-label">Select CTA Type</InputLabel>
        <Select
          labelId="type-select-label"
          id="type-select"
          value={selected.extIdType}
          label="Select CTA Type"
          onChange={(e) =>
            setSelected({ ...selectedBlank, extIdType: e.target.value })
          }
        >
          <MenuItem value="product">Product</MenuItem>
          <MenuItem value="category">Category</MenuItem>
          <MenuItem value="extUrl">External URL</MenuItem>
        </Select>
      </FormControl>

      {selected.extIdType === "product" && (
        <>
          <Box sx={{ display: "flex", mb: 2 }}>
            <TextField
              inputRef={idInput}
              size="small"
              sx={{
                flex: 1,
                "& label": { color: "#597681" },
                "& fieldset": { borderColor: "#b4c0f2", borderRadius: ".5rem" },
                "& fieldset:hover": { borderColor: "#b4bef2" },
              }}
              label="Product or Style ID"
              color="primary"
              variant="outlined"
              inputProps={{
                "aria-label": "product or style id (escape key to clear)",
              }}
              InputLabelProps={{shrink: true}} // This version MUI label shrink is buggy
              onKeyDown={handleIdKeydown}
              onChange={(e) =>
                setSelected({ ...selected, extId: e.target.value })
              }
              value={selected.extId}
            />
            <IconButton
              type="button"
              onClick={searchProductById}
              sx={{ ml: "5px", p: "8px", color: "#597684" }}
              aria-label="search"
            >
              <SearchIcon />
            </IconButton>
          </Box>
        </>
      )}

      {selected.extIdType === "category" && (
        <>
          <Autocomplete
            disablePortal
            options={ampSDK.getCategories().map((c) => {
              const val: AmpContentType = {
                extId: c.id,
                extIdType: "category",
                image: "",
                text: c.name,
              };
              return val;
            })}
            getOptionLabel={(option) => option.text}
            sx={{
              width: "100%",
              //   marginTop: "6px",
              mb: 2,
              "& label": { color: "#597681" },
              "& fieldset": { borderColor: "#b4c0f2", borderRadius: ".5rem" },
              "& fieldset:hover": { borderColor: "#b4bef2" },
            }}
            value={selected?.extId ? selected : null}
            onChange={(_, val) => {
              if (val !== null) {
                setSelected(val);
                ampSDK.setValue(val);
              } else {
                ampSDK.clearValue();
                setSelected({ ...selectedBlank, extIdType: "category" });
              }
            }}
            onClose={() => {
              ampSDK.setHeight(defaultHeight);
            }}
            onOpen={() => {
              ampSDK.setHeight(360);
            }}
            renderInput={(params) => <TextField {...params} label="Category" />}
          />
        </>
      )}

      {selected.extIdType === "extUrl" && (
        <Box sx={{ display: "flex", mb: 2 }}>
        <TextField
            size="small"
            sx={{
            flex: 1,
            "& label": { color: "#597681" },
            "& fieldset": { borderColor: "#b4c0f2", borderRadius: ".5rem" },
            "& fieldset:hover": { borderColor: "#b4bef2" },
            }}
            label="External URL"
            color="primary"
            variant="outlined"
            inputProps={{
            "aria-label": "product or style id (escape key to clear)",
            }}
            InputLabelProps={{shrink: true}} // This version MUI label shrink is buggy
            onChange={(e) => {
            const next: AmpContentType = {
                ...selected,
                extId: e.target.value,
            };
            setSelected(next);
            ampSDK.setValue(next);
            }}
            value={selected.extId}
        />
        </Box>
      )}

      {selected.extIdType && (
        <>
        
        <Box sx={{ display: "flex", mb: 2 }}>
        <TextField
            size="small"
            sx={{
            flex: 1,
            "& label": { color: "#597681" },
            "& fieldset": { borderColor: "#b4c0f2", borderRadius: ".5rem" },
            "& fieldset:hover": { borderColor: "#b4bef2" },
            }}
            label="Button and/or Alt Text"
            color="primary"
            variant="outlined"
            inputProps={{
            "aria-label": "Button and/or Alt Text",
            }}
            InputLabelProps={{shrink: true}} // This version MUI label shrink is buggy
            onChange={(e) => {
            const next: AmpContentType = {
                ...selected,
                text: e.target.value,
            };
            setSelected(next);
            ampSDK.setValue(next);
            }}
            value={selected.text}
        />
        </Box>
        <Box sx={{ display: "flex" }}>
        <TextField
            size="small"
            sx={{
            flex: 1,
            "& label": { color: "#597681" },
            "& fieldset": { borderColor: "#b4c0f2", borderRadius: ".5rem" },
            "& fieldset:hover": { borderColor: "#b4bef2" },
            }}
            label="Image URL (if applicable)"
            color="primary"
            variant="outlined"
            inputProps={{
            "aria-label": "Image URL (if applicable)",
            }}
            InputLabelProps={{shrink: true}} // This version MUI label shrink is buggy
            onChange={(e) => {
            const next: AmpContentType = {
                ...selected,
                image: e.target.value,
            };
            setSelected(next);
            ampSDK.setValue(next);
            }}
            value={selected.image}
        />
        </Box>
        </>
        )}
    </div>
  );
}
