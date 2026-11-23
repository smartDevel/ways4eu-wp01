import FavoritesView from "@/components/FavoritesView";

export const metadata = {
  title: "My favorites",
  description: "Your personally saved CurioSphere posts on this device.",
};

export default function FavoritesPage() {
  return (
    <section className="content-container favorites-page">
      <header className="favorites-intro">
        <p className="favorites-kicker">Personal reading list</p>
        <h1>My favorites</h1>
        <p>Saved posts stay in this browser on this device. No account is required.</p>
      </header>
      <FavoritesView />
    </section>
  );
}
