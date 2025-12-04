import app from "./app.js";

const PORT = process.env.PORT || 5000;
console.log(`App running on port ${PORT}`);
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
})