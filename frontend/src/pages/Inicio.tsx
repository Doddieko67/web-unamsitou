import { Welcome } from "../components/Main/Welcome";
import { OpcionExam } from "../components/Main/OpcionExam";

export function Main() {
    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Welcome />
            <OpcionExam />
        </main>
    );
}