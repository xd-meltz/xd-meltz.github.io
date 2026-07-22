import fs from "fs";

function analyze() {
  const html = fs.readFileSync("onedrive_page.html", "utf-8");
  console.log("HTML length:", html.length);
  
  // Let's find all script contents and look for strings like 'name' or '@content.downloadUrl' or 'resid'
  const scripts = html.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi) || [];
  console.log("Found", scripts.length, "scripts");
  
  for (let i = 0; i < scripts.length; i++) {
    const s = scripts[i];
    if (s.length > 2000) {
      console.log(`Script ${i} is long (${s.length} chars). First 100 chars:`, s.substring(0, 150));
      // Does it contain JPEG/PNG/JPG anywhere inside it?
      const jpegs = s.match(/\.(jpe?g|png|webp)/gi);
      console.log(`-- Contains jpg/png matches count:`, jpegs ? jpegs.length : 0);
      
      // Let's see if there are variables inside
      const vars = s.match(/(var|const|let)\s+([a-zA-Z0-9_$]+)\s*=/g);
      if (vars) {
        console.log(`-- Variables defined:`, vars.slice(0, 5));
      }
    }
  }
}

analyze();
