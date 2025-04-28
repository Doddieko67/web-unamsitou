import { OpcionExam } from "../components/Main/OpcionExam";
import { Welcome } from "../components/Main/Welcome";

function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Welcome></Welcome>
      <OpcionExam></OpcionExam>
    </main>
  );
}

export default Home;
