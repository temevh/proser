import "./App.css";
import { useState } from "react";
import { write, utils } from "xlsx";
import { saveAs } from "file-saver";

function App() {
  const [paragraphs, setParagraphs] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingSuccesfull, setProcessingSuccesfull] = useState(false);

  const API_URL = "https://proservanda-5a6f43880615.herokuapp.com";
  //const API_URL = process.env.REACT_APP_API_URL;

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
        const imageData = reader.result.split(",")[1];

        console.log(imageData);
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
        <p className="subText">
          (Currently only supporting COAL forms in PNG format)
        </p>
        <input type="file" accept="image/png" onChange={handleFileChange} />
        <p>2. Start the image scan</p>
        <button onClick={handleButtonClick} disabled={!file || loading}>
          {"Start Processing"}
        </button>
        {loading ? <p>Processing...</p> : null}
        {processingSuccesfull ? (
          <div>
            <h3>File processed succesfully!</h3>
            <button onClick={handleExportClick}>{"Export file as XLSX"}</button>
          </div>
        ) : null}
      </header>
    </div>
  );
}

export default App;
