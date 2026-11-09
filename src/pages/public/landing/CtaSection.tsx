import { Link } from "react-router";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "../../../components/ui/Primitives";
import { Footer } from "../../../components/layout/Footer";

export function CtaSection() {
  return (
    <>
      <section className="px-5 pb-24">
        <div className="pattern mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-mina px-6 py-14 text-center text-white md:px-14">
          <Zap className="mx-auto text-sun" />
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-extrabold md:text-4xl">
            Ton prochain chapitre commence aujourd’hui.
          </h2>
          <p className="mt-4 text-sm text-teal-50">
            3 jours pour découvrir Mina, sans engagement et sans carte bancaire.
          </p>
          <Link to="/register">
            <Button className="mt-7 bg-white text-mina hover:bg-teal-50">
              Commencer mon essai gratuit <ArrowRight size={17} />
            </Button>
          </Link>
        </div>
      </section>
      <Footer />
    </>
  );
}
