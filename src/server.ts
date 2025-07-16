import app from './app.js';
import dotenv from 'dotenv'

dotenv.config({
    path:'.env'
})

const PORT = process.env.PORT || 3000;

try {
  app.listen(PORT, () => {
    console.log(` Server running at http://localhost:${PORT}`);
  });
} catch (error) {
  console.error('Server failed to start:', error);
}
