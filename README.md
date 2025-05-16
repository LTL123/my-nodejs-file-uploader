# My Node.js File Uploader

Node.js application with file upload to Tencent COS and AI-powered image analysis using OpenRouter.

## Project Structure

- `Index.html`: Frontend HTML, CSS, and JavaScript.
- `Node.js`: Backend Express server handling file uploads and AI analysis API calls.
- `package.json`: Project dependencies and scripts.
- `Procfile`: Defines process types for platforms like Heroku.
- `.gitignore`: Specifies intentionally untracked files that Git should ignore.
- `uploads/`: Directory for temporary file storage during upload (should be in `.gitignore`).
- `.env`: (Not committed) Stores environment variables like API keys.

## Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/LTL123/my-nodejs-file-uploader.git
    cd my-nodejs-file-uploader
    ```

2.  **Create a `.env` file** in the project root with your credentials:
    ```env
    COS_SECRET_ID=your_cos_secret_id
    COS_SECRET_KEY=your_cos_secret_key
    # The OpenRouter API Key is hardcoded in Node.js for now, but should ideally be in .env
    # OPENROUTER_API_KEY=your_openrouter_api_key
    ```
    *Note: The OpenRouter API key is currently hardcoded in `Node.js`. For better security, it should be moved to the `.env` file and accessed via `process.env.OPENROUTER_API_KEY`.*

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Run the application:**
    ```bash
    node Node.js
    ```
    The application will be available at `http://localhost:3000`.

## Features

-   File upload (images) to Tencent Cloud Object Storage (COS).
-   Progress bar for uploads.
-   AI-powered image analysis ("What is this?") using OpenRouter API (Qwen model).

## Deployment Notes

-   **Frontend**: `Index.html` can be served by GitHub Pages if the backend is hosted elsewhere.
-   **Backend**: `Node.js` server needs a Node.js hosting environment (e.g., Heroku, Vercel, AWS, Google Cloud). The `Procfile` is set up for Heroku-like platforms.
-   **Environment Variables**: Ensure `COS_SECRET_ID` and `COS_SECRET_KEY` (and ideally `OPENROUTER_API_KEY`) are configured in the deployment environment.
-   **GitHub Pages for Frontend**:
    1.  Go to repository Settings > Pages.
    2.  Choose the `main` branch and `/ (root)` folder as the source.
    3.  The site will be available at `https://LTL123.github.io/my-nodejs-file-uploader/Index.html` (or just the repo name if `Index.html` is at the root).
    4.  **Important**: For GitHub Pages, API calls from `Index.html` to `/upload` and `/analyze` will fail unless the backend is hosted on a publicly accessible server and the URLs in `Index.html` are updated to point to that server.

## TODO

-   Move OpenRouter API key from hardcoded value in `Node.js` to `.env` file.
-   Implement proper error handling and user feedback on the frontend.
-   Consider adding a `start` script to `package.json` (e.g., `"start": "node Node.js"`).
