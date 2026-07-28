$root = $PSScriptRoot

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\summarizer'; python app.py"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; npm run dev"
