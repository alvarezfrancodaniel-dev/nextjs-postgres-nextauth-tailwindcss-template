'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="p-4 md:p-6">
      <div className="mb-8 space-y-4">
        <h1 className="font-semibold text-lg md:text-2xl">
          Error al cargar los datos
        </h1>
        <p className="text-muted-foreground">
          Ocurrio un problema al conectar con la base de datos. Verifica que las tablas esten creadas correctamente.
        </p>
        <Button onClick={reset} variant="outline">
          Reintentar
        </Button>
      </div>
    </main>
  );
}
