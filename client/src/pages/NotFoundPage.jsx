import { useNavigate } from "react-router-dom";
import { MapPinOff } from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface px-6 text-center overflow-hidden">
      <div className="relative mb-8 flex h-32 w-32 items-center justify-center">
        <div className="absolute h-full w-full animate-ping rounded-full bg-text-primary/10 duration-1000"></div>
        <div className="relative z-10 flex h-24 w-24 animate-bounce items-center justify-center rounded-full bg-text-primary shadow-2xl shadow-text-primary/20">
          <MapPinOff className="text-bg-primary" size={48} strokeWidth={1.5} />
        </div>
      </div>
      <h1 className="mb-2 text-7xl font-black tracking-tight text-text-primary drop-shadow-sm">
        404
      </h1>
      <h2 className="mb-4 text-2xl font-bold tracking-wide text-text-primary/80 uppercase">
        Signal Lost
      </h2>
      <p className="mb-10 max-w-md text-base text-text-muted">
        It looks like you've ventured into uncharted territory. The coordinate you're looking for doesn't exist or has been moved.
      </p>

      <button
        onClick={() => navigate("/", { replace: true })}
        className="rounded-xl bg-text-primary px-10 py-4 font-semibold tracking-wide text-white shadow-lg transition-all hover:bg-neutral-800 hover:shadow-xl active:scale-[0.98]"
      >
        Return to Safety
      </button>

    </div>
  );
};

export default NotFoundPage;