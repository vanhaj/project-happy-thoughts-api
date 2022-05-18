import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import listEndpoints from 'express-list-endpoints';

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/happy-thoughts';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const Thought = mongoose.model('Thought', {
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 140,
    trim: true,
  },
  like: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
});

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.get('/', (req, res) => {
  res.send({
    'Happy thoughts api - Vanessa Hajek. See frontend here: https://happy-thoughts-van.netlify.app/':
      listEndpoints(app),
  });
});

// showing latest 20 thoughts
app.get('/happy-thoughts', async (req, res) => {
  const thought = await Thought.find()
    .sort({ createdAt: 'desc' })
    .limit(20)
    .exec();
  res.status(200).json(thought);
});

// adding a thought to the database
app.post('/happy-thoughts', async (req, res) => {
  const { message } = req.body;

  const thought = await new Thought({ message });

  try {
    const savedThought = await thought.save();
    res.status(201).json({ response: savedThought, success: true });
  } catch (err) {
    res.status(400).json({
      message: 'Could not save your happy thought to the Database ',
      response: error,
      success: false,
    });
  }
});

app.post('/happy-thoughts/:id/like', async (req, res) => {
  const { id } = req.params;
  try {
    const likeToUpdate = await Thought.findByIdAndUpdate(
      id,
      {
        $inc: { like: 1 },
      },
      { new: true }
    );
    res.status(200).json({
      response: `Like ${likeToUpdate.message} has been updated`,
      success: true,
    });
  } catch (error) {
    res.status(400).json({ response: error, success: false });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
