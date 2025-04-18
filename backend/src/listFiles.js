import * as fs from 'fs/promises'; // Import the promise-based fs module
import path from 'path'; // Import the path module

export async function listFiles(directoryPath) {
  try {
    // Read the directory contents. 'withFileTypes: true' gives us Dirent objects
    // which tell us if an entry is a file or directory without an extra 'stat' call.
    const dirents = await fs.readdir(directoryPath, { withFileTypes: true });

    // Filter the Dirent objects to keep only files, then map to get their names.
    const files = dirents
      .filter(dirent => dirent.isFile())
      .map(dirent => path.join(directoryPath, dirent.name));

    console.log(`Files in directory "${directoryPath}":`);
    console.log(files);
    return files; // Optionally return the array of filenames

  } catch (err) {
    console.error(`Error reading directory ${directoryPath}:`, err);
    // Handle the error appropriately (e.g., throw it, return empty array)
    return [];
  }
}

export async function create_directory(targetDirectory) {
  try {
    await fs.mkdir(targetDirectory, { recursive: true });
    console.log(`Directory "${targetDirectory}" created successfully.`);
  } catch (err) {
    console.error(`Error creating directory ${targetDirectory}:`, err);
  }
}

export async function delete_directory(targetDirectory) {
  try {
    await fs.rm(targetDirectory, { recursive: true });
    console.log(`Directory "${targetDirectory}" deleted successfully.`);
  } catch (err) {
    console.error(`Error deleting directory ${targetDirectory}:`, err);
  }
}
