import "./App.css";
import { useState } from "react";
import { write, utils } from "xlsx";
import { saveAs } from "file-saver";

function App() {
  const [paragraphs, setParagraphs] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingSuccesfull, setProcessingSuccesfull] = useState(false);

  const serverUrl = "http://localhost:3001/process-document";

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      console.log(selectedFile);
    }
  };

  const handleButtonClick = async () => {
    if (file) {
      setLoading(true);
      const reader = new FileReader();

      reader.onloadend = async () => {
        const imagedata = reader.result.split(",")[1];
        try {
          const response = await fetch(serverUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              imagedata,
            }),
          });

          const data = await response.json();
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
    const workbook = utils.book_new();
    const worksheet = utils.json_to_sheet(
      paragraphs.map((paragraph) => ({ Paragraph: paragraph }))
    );
    utils.book_append_sheet(workbook, worksheet, "Paragraphs");
    const excelBuffer = write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "coalData.xlsx");
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="headerText">Demo for Proservanda</h1>
        <p>1. Choose file to upload</p>
        <input type="file" accept="image/png" onChange={handleFileChange} />
        <p>2. Start the image scan</p>
        <button onClick={handleButtonClick} disabled={!file || loading}>
          {"Start Processing"}
        </button>
        {loading ? <p>Processing...</p> : null}
        {processingSuccesfull ? (
          <div>
            <h3>File processed succesfully!</h3>
            <button onClick={handleExportClick}>{"Export file"}</button>
          </div>
        ) : null}
        {/*
        <ul>
          {paragraphs.map((paragraph, index) => (
            <li key={index}>{paragraph}</li>
          ))}
        </ul>
            */}
      </header>
    </div>
  );
}

export default App;
