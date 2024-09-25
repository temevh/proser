import { useState } from "react";

const ProcessButton = () => {
    const [paragraphs, setParagraphs] = useState([]);
    const [file, setFile] = useState(null);

    const API_URL = "https://proservanda-5a6f43880615.herokuapp.com";


    const handleProcessButtonClick = async () => {
        if (file) {
          //setLoading(true);
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
              //setProcessingSuccesfull(true);
            } catch (error) {
              console.error("Error:", error);
            } finally {
              //setLoading(false);
            }
          };
    
          reader.onerror = (error) => {
            console.error("FileReader Error:", error);
            //setLoading(false);
          };
    
          reader.readAsDataURL(file);
        }
      };
    
    return(
        <button
        onClick={handleProcessButtonClick}
        //disabled={!file || loading}
        className="processButton"
      >
        {"Iniciar "}
      </button>
    )

}

export default ProcessButton;