import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TrendingUp, Calculator, Target, AlertTriangle, PartyPopper } from "lucide-react";
import { calculateYearsToMillion, determineScenario, getRatesByProfile } from "@/lib/calculator";

// Zod Schema Definition
const calculatorSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  age: z.coerce.number().min(18, "Você deve ter pelo menos 18 anos").max(100, "Idade inválida"),
  currentInvestment: z.string().transform((val) => {
    return Number(val.replace(/\D/g, ""));
  }),
  monthlyInvestment: z.string().transform((val) => {
    return Number(val.replace(/\D/g, ""));
  }),
  profile: z.enum(["conservative", "aggressive"], {
    required_error: "Selecione um perfil",
  }),
});

type CalculatorFormValues = z.infer<typeof calculatorSchema>;

interface CalculationResult {
  yearsReal: number;
  yearsOptimized: number;
  scenario: "iniciante" | "investidor";
  name: string;
}

const MillionCalculator = () => {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<z.input<typeof calculatorSchema>>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      name: "",
      age: "" as any,
      currentInvestment: "0",
      monthlyInvestment: "0",
      profile: "conservative",
    },
  });

  const formatCurrency = (value: string) => {
    if (!value) return "";
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: string) => void) => {
    const rawValue = e.target.value;
    const formatted = formatCurrency(rawValue);
    onChange(formatted);
  };

  const onSubmit = (data: CalculatorFormValues) => {
    setIsCalculating(true);

    setTimeout(() => {
      const { currentInvestment: pv, monthlyInvestment: pmt, profile, name } = data;
      const { realRate, optimizedRate } = getRatesByProfile(profile);

      const yearsReal = calculateYearsToMillion(pv, pmt, realRate);
      const yearsOptimized = calculateYearsToMillion(pv, pmt, optimizedRate);
      const scenario = determineScenario(pv, profile);

      setResult({
        yearsReal,
        yearsOptimized,
        scenario,
        name,
      });

      setIsCalculating(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Calculadora do Milhão
          </h1>
          <p className="text-muted-foreground">
            Descubra em quanto tempo você pode conquistar seu primeiro milhão
          </p>
        </div>

        {/* Calculator Form */}
        {!result && (
          <Card className="shadow-lg border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="w-5 h-5 text-primary" />
                Seus Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-5">

                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seu Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite seu nome" {...field} className="h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Age */}
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Idade Atual</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ex: 30"
                            {...field}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Current Investment */}
                  <FormField
                    control={form.control}
                    name="currentInvestment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quanto já tem investido? (R$)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              R$
                            </span>
                            <Input
                              placeholder="0"
                              value={field.value}
                              onChange={(e) => handleCurrencyChange(e, field.onChange)}
                              className="h-12 pl-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Monthly Investment */}
                  <FormField
                    control={form.control}
                    name="monthlyInvestment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quanto pode investir por mês? (R$)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              R$
                            </span>
                            <Input
                              placeholder="0"
                              value={field.value}
                              onChange={(e) => handleCurrencyChange(e, field.onChange)}
                              className="h-12 pl-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Profile */}
                  <FormField
                    control={form.control}
                    name="profile"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Perfil de Investidor</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-3"
                          >
                            <FormItem>
                              <FormLabel className="font-normal">
                                <label
                                  htmlFor="conservative"
                                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${field.value === "conservative"
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                    }`}
                                >
                                  <FormControl>
                                    <RadioGroupItem value="conservative" id="conservative" className="mt-0.5" />
                                  </FormControl>
                                  <div>
                                    <div className="font-medium text-foreground">Segurança acima de tudo</div>
                                    <div className="text-sm text-muted-foreground">
                                      Poupança, CDB, Tesouro Direto
                                    </div>
                                  </div>
                                </label>
                              </FormLabel>
                            </FormItem>
                            <FormItem>
                              <FormLabel className="font-normal">
                                <label
                                  htmlFor="aggressive"
                                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${field.value === "aggressive"
                                    ? "border-secondary bg-secondary/5"
                                    : "border-border hover:border-secondary/50"
                                    }`}
                                >
                                  <FormControl>
                                    <RadioGroupItem value="aggressive" id="aggressive" className="mt-0.5" />
                                  </FormControl>
                                  <div>
                                    <div className="font-medium text-foreground">Aceito risco para ganhar mais</div>
                                    <div className="text-sm text-muted-foreground">
                                      Ações, FIIs, Criptomoedas
                                    </div>
                                  </div>
                                </label>
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isCalculating}
                    className="w-full h-14 text-lg font-semibold shadow-md hover:shadow-lg transition-all"
                    size="lg"
                  >
                    {isCalculating ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span> Calculando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        CALCULAR MEU MILHÃO
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {result.scenario === "iniciante" ? (
              /* CENÁRIO 1: INICIANTE */
              <Card className="shadow-lg border-destructive/30 bg-destructive/5">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-2">
                      <AlertTriangle className="w-8 h-8 text-destructive" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">
                      🚨 {result.name}, alerta vermelho!
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      No seu ritmo atual, você levará{" "}
                      <span className="font-bold text-destructive text-lg">
                        {result.yearsReal.toFixed(1)} anos
                      </span>{" "}
                      para chegar ao milhão. Isso é muito tempo.
                    </p>
                    <div className="bg-card rounded-lg p-4 border border-border">
                      <p className="text-foreground">
                        Com a <span className="font-semibold text-secondary">Estratégia de Aceleração</span>, você
                        poderia reduzir isso para apenas{" "}
                        <span className="font-bold text-secondary text-lg">
                          {result.yearsOptimized.toFixed(1)} anos
                        </span>
                        .
                      </p>
                    </div>

                    <a
                      href="#offer-iniciante"
                      className="inline-flex items-center justify-center w-full h-14 px-6 text-lg font-semibold rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md hover:shadow-lg transition-all"
                    >
                      Baixar Plano de Aceleração (R$ 97)
                    </a>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* CENÁRIO 2: INVESTIDOR */
              <Card className="shadow-lg border-secondary/30 bg-secondary/5">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-2">
                      <PartyPopper className="w-8 h-8 text-secondary" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">
                      🎉 Parabéns, {result.name}!
                    </h2>
                    <p className="text-lg font-medium text-secondary">
                      Você está no caminho da Elite.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Sua projeção aponta que você chegará lá em apenas{" "}
                      <span className="font-bold text-secondary text-lg">
                        {result.yearsReal.toFixed(1)} anos
                      </span>
                      . Você já está acima da média!
                    </p>
                    <div className="bg-card rounded-lg p-4 border border-border">
                      <p className="text-foreground">
                        Mas sabia que com{" "}
                        <span className="font-semibold text-primary">Eficiência Tributária</span> você pode
                        antecipar isso para{" "}
                        <span className="font-bold text-primary text-lg">
                          {result.yearsOptimized.toFixed(1)} anos
                        </span>
                        ?
                      </p>
                    </div>

                    <a
                      href="#offer-expert"
                      className="inline-flex items-center justify-center w-full h-14 px-6 text-lg font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
                    >
                      Conhecer Mentoria Avançada
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recalculate Button */}
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
              }}
              className="w-full h-12"
            >
              Fazer Nova Simulação
            </Button>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          * Simulação baseada em projeções de rentabilidade. Investimentos possuem riscos.
        </p>
      </div>
    </div>
  );
};

export default MillionCalculator;
