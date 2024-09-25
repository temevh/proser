import { useState } from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Box from "@mui/material/Box";

const FileFormSelect = () => {
    const [filetype, setFiletype] = useState("PNG");
    const [formType, setFormType] = useState("COAL");

    const handleFileTypeChange = (event) => {
        setFiletype(event.target.value);
      };
    
      const handleFormTypeChange = (event) => {
        setFormType(event.target.value);
      };

    return(
        <Box sx={{ minWidth: 200, display: "flex", gap: 5 }}>
            <FormControl>
                <InputLabel sx={{ color: "white" }}>Proveedor de salud</InputLabel>
                <Select
                value={formType}
                label="File type"
                onChange={handleFormTypeChange}
                sx={{ color: "white", width: "140px" }}
                //disabled={loading}
                >
                <MenuItem value={"COAL"}>COAL</MenuItem>
                <MenuItem value={"DOC"}>DOC</MenuItem>
                <MenuItem value={"HYS"}>HYS</MenuItem>
                </Select>
            </FormControl>
            <FormControl>
                <InputLabel sx={{ color: "white" }}>Tipo de archivo</InputLabel>
                <Select
                value={filetype}
                label="File type"
                onChange={handleFileTypeChange}
                sx={{ color: "white", width: "120px" }}
                //disabled={loading}
                >
                <MenuItem value={"PNG"}>PNG</MenuItem>
                <MenuItem value={"PDF"}>PDF</MenuItem>
                <MenuItem value={"JPEG"}>JPEG</MenuItem>
                </Select>
            </FormControl>
        </Box>
    )

}

export default FileFormSelect;