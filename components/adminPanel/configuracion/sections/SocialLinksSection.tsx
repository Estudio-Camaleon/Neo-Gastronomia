import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister } from "react-hook-form";

interface SocialLinksFields {
  instagram_url: string;
  facebook_url: string;
}
// Usamos UseFormRegister<any> para que TypeScript sepa qué es 'register'
// y el linter deje de marcar error por el 'any' directo.
export function SocialLinksSection({
  register,
}: {
  register: UseFormRegister<SocialLinksFields>;
}) {
  return (
    <div className="space-y-4 p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
      <h3 className="text-xl font-bold uppercase italic">Redes Sociales</h3>
      <div className="grid gap-4">
        <div>
          <Label>Instagram (URL completa)</Label>
          <Input
            {...register("instagram_url")}
            placeholder="https://instagram.com/tu-negocio"
            className="border-2 border-black"
          />
        </div>
        <div>
          <Label>Facebook</Label>
          <Input
            {...register("facebook_url")}
            placeholder="https://facebook.com/tu-negocio"
            className="border-2 border-black"
          />
        </div>
      </div>
    </div>
  );
}
