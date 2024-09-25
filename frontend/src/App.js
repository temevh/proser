import "./App.css";
import { useState, useRef } from "react";
import { write, utils } from "xlsx";
import { saveAs } from "file-saver";
import Box from "@mui/material/Box";

import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FileFormSelect from "./mainView/FileFormSelect";
import FileSelection from "./mainView/FileSelection";

function App() {
  const [paragraphs, setParagraphs] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingSuccesfull, setProcessingSuccesfull] = useState(false);

  const [isRelevantFieldsChecked, setIsRelevantFieldsChecked] = useState(true);

  const fileInputRef = useRef(null);

  //const API_URL = process.env.REACT_APP_API_URL;
  const API_URL = "https://proservanda-5a6f43880615.herokuapp.com";
  //const API_URL = "http://localhost:3001";

  const relevantFields = ["Orden", "Nombre", "Tipo"];

  const handleCheckboxChange = (event) => {
    setIsRelevantFieldsChecked(event.target.checked);
  };

  const handleButtonClick = async () => {
    if (file) {
      setLoading(true);
      const reader = new FileReader();

      reader.onloadend = async () => {
        const imageData = reader.result.split(",")[1];

        try {
          const response = await fetch(`${API_URL}/process-document`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              imageData,
            }),
          });

          const data = await response.json();
          console.log("data", data);
          setParagraphs(data.paragraphs);
          setProcessingSuccesfull(true);
        } catch (error) {
          console.error("Error:", error);
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = (error) => {
        console.error("FileReader Error:", error);
        setLoading(false);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleExportClick = () => {
    const containsRelevantWord = (paragraph) => {
      return relevantFields.some((word) => paragraph.includes(word));
    };

    const filteredParagraphs = isRelevantFieldsChecked
      ? paragraphs.filter(containsRelevantWord)
      : paragraphs;

    const workbook = utils.book_new();
    const worksheet = utils.json_to_sheet(
      filteredParagraphs.map((paragraph) => ({ Paragraph: paragraph }))
    );
    utils.book_append_sheet(workbook, worksheet, "Paragraphs");
    const excelBuffer = write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "coalData.xlsx");
  };

  const fieldResetClick = () => {
    setFile(null);
    setParagraphs([]);
    //setFiletype("PNG");
    //setFormType("COAL");
    setIsRelevantFieldsChecked(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCustomFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="headerText">Demo incapacidades proservanda</h1>
        <p>1. Elige un archivo para procesar</p>
        <FileFormSelect />
        <p className="subText">
          (Por el momento sólo se procesan incapacidades de COAL en formato PNG)
        </p>
        <FileSelection />
        <button onClick={handleCustomFileInputClick} disabled={loading}>
          Elige un archivo
        </button>
        <Box sx={{ display: "flex" }}>
          <p className="fileHeaderText">Selected file:</p>
          <p className="fileText">{file ? file.name : "No file chosen"}</p>
        </Box>
        <p>2. Iniciar escaneo de incapacidad </p>
        <button
          onClick={handleButtonClick}
          disabled={!file || loading}
          className="processButton"
        >
          {"Iniciar "}
        </button>
        <FormControlLabel
          control={
            <Checkbox
              checked={isRelevantFieldsChecked}
              onChange={handleCheckboxChange}
            />
          }
          label="Sólo campos relevantes"
        />

        {loading ? <p>Procesando...</p> : null}
        {processingSuccesfull ? (
          <div>
            <h3>Incapacidad procesada!</h3>
            <button onClick={handleExportClick}>{"Exportar a XLSX"}</button>
          </div>
        ) : null}
        <button
          onClick={fieldResetClick}
          disabled={loading}
          className="resetButton"
        >
          {"LIMPIAS LOS CAMPOS"}
        </button>
      </header>
    </div>
  );
}

export default App;
