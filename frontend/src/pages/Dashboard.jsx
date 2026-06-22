const Dashboard = () => {
  return (
    <div className="min-h-screen bg-bg-sec p-8 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-border-main text-center">
        <h1 className="text-3xl font-display font-bold text-text-main mb-4">
          Welcome to StoreSync Dashboard
        </h1>
        <p className="text-text-sec">
          You have successfully logged in.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
