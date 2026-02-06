import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { signIn } from '@/lib/auth';
import { CircleDot } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex justify-center items-start md:items-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CircleDot className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl">Gomeria</CardTitle>
          <CardDescription>
            Inicia sesion para acceder al sistema de gestion.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <form
            action={async () => {
              'use server';
              await signIn('github', {
                redirectTo: '/'
              });
            }}
            className="w-full"
          >
            <Button className="w-full">Iniciar Sesion con GitHub</Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
