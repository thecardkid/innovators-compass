const fs = require('fs');
const path = require('path');
const jsonfile = require('jsonfile');

let htmlString = '';
const imageFilePathRegex = /s3-static\/(images\/.*\.png)/;

function escapeHTML(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function beginHTML5Template() {
  htmlString += `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<!-- TODO include build id -->
<title>Test Reporter</title>
<link rel="stylesheet" href="app.css">
</head>

<body>
<div id="container">

<div id="controls">

</div>

<div id="report">

`;
}

function endHTML5Template() {
  htmlString += ` 
</div> <!-- #reports -->
</div> <!-- #container -->

</body>

</html> 
`;
}

function beginSpecSection(specName) {
  htmlString += `
<section class="spec-section">
<h1>${specName}</h1>
`;
}

function endSpecSection() {
  htmlString += `
</section> 
`;
}

function addFailure(failure) {
  const imageFp = imageFilePathRegex.exec(failure.screenshot)[1];
  htmlString += `
<div class="test-failure">
    <h4>${failure.testName}</h4>
    <img src="${imageFp}" />
    <div class="test-error-message">
        ${escapeHTML(failure.errorMessage)}
    </div>
</div>
`;
}

// spec file -> individual test -> failure data
const data = jsonfile.readFileSync(path.resolve(__dirname, 'data.json'));

beginHTML5Template();

for (let spec in data) {
  if (!data.hasOwnProperty(spec)) {
    continue;
  }
  const failures = data[spec];
  beginSpecSection(spec);
  failures.forEach(addFailure);
  endSpecSection();
}
endHTML5Template();

fs.writeFileSync(path.resolve(__dirname, 's3-static/index.html'), htmlString);
