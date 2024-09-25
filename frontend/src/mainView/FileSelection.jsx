import { useState, useRef } from "react";

const FileSelection = () => {
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
          setFile(selectedFile);
          console.log(selectedFile);
        }
      };
    

    return(
        <input
        type="file"
        accept="image/png"
        onChange={handleFileChange}
        //disabled={loading}
        ref={fileInputRef}
        style={{ display: "none" }}
      />

    )
}

export default FileSelection;