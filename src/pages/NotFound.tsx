import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-8">
        <div className="bg-destructive text-destructive-foreground brutal-border brutal-shadow px-8 py-4 inline-block transform -rotate-2">
          <h1 className="text-4xl font-black uppercase">404 ERROR</h1>
        </div>
        <div className="bg-muted brutal-border brutal-shadow px-8 py-6">
          <p className="text-xl font-bold uppercase text-foreground mb-4">PAGE NOT FOUND</p>
          <p className="text-sm font-bold uppercase text-muted-foreground">
            THE PAGE YOU'RE LOOKING FOR DOESN'T EXIST
          </p>
        </div>
        <a 
          href="/" 
          className="bg-primary text-primary-foreground brutal-border brutal-shadow px-8 py-4 inline-block font-black uppercase hover:brutal-shadow-lg transition-all transform hover:-translate-y-1"
        >
          RETURN HOME
        </a>
      </div>
    </div>
  );
};

export default NotFound;
