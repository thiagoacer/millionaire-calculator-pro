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
    <div className="min-h-screen bg-background py-12 px-4 font-body">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent mb-6 border border-secondary/20 shadow-sm">
            <Target className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl md:text-5xl font-heading font-medium text-foreground mb-4 tracking-tight">
            Calculadora do Milhão
          </h1>
          <p className="text-muted-foreground text-lg max-w-sm mx-auto leading-relaxed">
            Planejamento patrimonial para mulheres que valorizam exclusividade e retorno.
          </p>
        </div>

        {/* Calculator Form */}
        {!result && (
          <Card className="shadow-sm border border-border/60 bg-card/80 backdrop-blur-sm rounded-xl">
            <CardHeader className="pb-6 pt-8 px-8 border-b border-border/40">
              <CardTitle className="flex items-center gap-3 text-xl font-heading font-medium text-primary">
                <Calculator className="w-5 h-5 text-secondary" strokeWidth={1.5} />
                Seus Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">

                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80 font-medium">Seu Nome</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Como gostaria de ser chamada?"
                            {...field}
                            className="h-12 bg-transparent border-x-0 border-t-0 border-b border-border/60 focus:border-secondary focus:ring-0 focus:ring-offset-0 px-0 rounded-none text-lg transition-all placeholder:text-muted-foreground/40"
                          />
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
                        <FormLabel className="text-foreground/80 font-medium">Idade Atual</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ex: 30"
                            {...field}
                            className="h-12 bg-transparent border-x-0 border-t-0 border-b border-border/60 focus:border-secondary focus:ring-0 focus:ring-offset-0 px-0 rounded-none text-lg transition-all placeholder:text-muted-foreground/40"
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
                        <FormLabel className="text-foreground/80 font-medium">Quanto já tem investido? (R$)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 font-serif italic text-lg">
                              R$
                            </span>
                            <Input
                              placeholder="0"
                              value={field.value}
                              onChange={(e) => handleCurrencyChange(e, field.onChange)}
                              className="h-12 pl-12 bg-transparent border-x-0 border-t-0 border-b border-border/60 focus:border-secondary focus:ring-0 focus:ring-offset-0 px-0 rounded-none text-lg transition-all font-medium placeholder:text-muted-foreground/40"
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
                        <FormLabel className="text-foreground/80 font-medium">Quanto pode investir por mês? (R$)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 font-serif italic text-lg">
                              R$
                            </span>
                            <Input
                              placeholder="0"
                              value={field.value}
                              onChange={(e) => handleCurrencyChange(e, field.onChange)}
                              className="h-12 pl-12 bg-transparent border-x-0 border-t-0 border-b border-border/60 focus:border-secondary focus:ring-0 focus:ring-offset-0 px-0 rounded-none text-lg transition-all font-medium placeholder:text-muted-foreground/40"
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
                      <FormItem className="space-y-4">
                        <FormLabel className="text-foreground/80 font-medium text-lg">Perfil de Investidor</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 gap-4"
                          >
                            <FormItem>
                              <FormLabel className="font-normal w-full cursor-pointer">
                                <label
                                  htmlFor="conservative"
                                  className={`flex items-start gap-4 p-5 rounded-lg border transition-all duration-300 w-full hover:shadow-md ${field.value === "conservative"
                                    ? "border-primary/30 bg-primary/5 ring-1 ring-primary/20"
                                    : "border-border/60 bg-background hover:border-primary/20"
                                    }`}
                                >
                                  <FormControl>
                                    <RadioGroupItem value="conservative" id="conservative" className="mt-1 text-primary border-muted-foreground/40" />
                                  </FormControl>
                                  <div>
                                    <div className="font-heading font-medium text-lg text-foreground mb-1">Preservação de Capital</div>
                                    <div className="text-sm text-muted-foreground leading-relaxed">
                                      Prefiro segurança e previsibilidade. <br />
                                      <span className="text-primary/80 font-medium mt-1 inline-block">Renda Fixa (CDBs, Tesouro Direto e Fundos)</span>
                                    </div>
                                  </div>
                                </label>
                              </FormLabel>
                            </FormItem>
                            <FormItem>
                              <FormLabel className="font-normal w-full cursor-pointer">
                                <label
                                  htmlFor="aggressive"
                                  className={`flex items-start gap-4 p-5 rounded-lg border transition-all duration-300 w-full hover:shadow-md ${field.value === "aggressive"
                                    ? "border-secondary/50 bg-secondary/10 ring-1 ring-secondary/30"
                                    : "border-border/60 bg-background hover:border-secondary/30"
                                    }`}
                                >
                                  <FormControl>
                                    <RadioGroupItem value="aggressive" id="aggressive" className="mt-1 text-secondary border-muted-foreground/40" />
                                  </FormControl>
                                  <div>
                                    <div className="font-heading font-medium text-lg text-foreground mb-1">Construção de Patrimônio</div>
                                    <div className="text-sm text-muted-foreground leading-relaxed">
                                      Busco rentabilidade acima da média. <br />
                                      <span className="text-secondary/90 font-medium mt-1 inline-block">Ações, FIIs, Investimentos Globais</span>
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
                    className="w-full h-14 text-sm uppercase tracking-[0.15em] font-medium shadow-lg shadow-primary/5 hover:shadow-xl transition-all rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 mt-6"
                    size="lg"
                  >
                    {isCalculating ? (
                      <span className="flex items-center gap-3">
                        <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Calculando Futuro...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 font-heading">
                        <TrendingUp className="w-5 h-5" strokeWidth={1.5} />
                        PROJETAR MEU MILHÃO
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
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {result.scenario === "iniciante" ? (
              /* CENÁRIO 1: INICIANTE */
              <Card className="shadow-2xl shadow-destructive/5 border border-destructive/20 bg-background">
                <CardContent className="pt-8 pb-8 px-8">
                  <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/5 mb-2 border border-destructive/10">
                      <AlertTriangle className="w-8 h-8 text-destructive" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-heading font-medium text-foreground">
                      {result.name}, atenção ao seu futuro.
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-lg max-w-md mx-auto">
                      No seu ritmo atual, a liberdade financeira pode demorar{" "}
                      <span className="font-bold text-destructive text-xl font-heading">
                        {result.yearsReal.toFixed(1)} anos
                      </span>{" "}
                      para chegar.
                    </p>
                    <div className="bg-accent/30 rounded-lg p-6 border border-accent/50 max-w-sm mx-auto">
                      <p className="text-foreground/90">
                        Com uma <span className="font-semibold text-primary">Estratégia de Aceleração</span>, você
                        poderia reduzir isso para apenas{" "}
                        <span className="font-bold text-primary text-xl font-heading block mt-2">
                          {result.yearsOptimized.toFixed(1)} anos
                        </span>
                      </p>
                    </div>

                    <a
                      href="#offer-iniciante"
                      className="inline-flex items-center justify-center w-full h-14 px-8 text-lg font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/10 hover:shadow-xl transition-all font-heading"
                    >
                      Acessar Plano de Aceleração
                    </a>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* CENÁRIO 2: INVESTIDOR */
              <Card className="shadow-2xl shadow-secondary/10 border border-secondary/20 bg-background">
                <CardContent className="pt-8 pb-8 px-8">
                  <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/10 mb-2 border border-secondary/20">
                      <PartyPopper className="w-8 h-8 text-secondary-foreground" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-heading font-medium text-foreground">
                      Parabéns, {result.name}!
                    </h2>
                    <p className="text-lg font-medium text-secondary-foreground font-heading">
                      Você está construindo um legado sólido.
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-lg max-w-md mx-auto">
                      Sua projeção aponta que você chegará lá em{" "}
                      <span className="font-bold text-secondary-foreground text-xl font-heading">
                        {result.yearsReal.toFixed(1)} anos
                      </span>
                      .
                    </p>
                    <div className="bg-accent/40 rounded-lg p-6 border border-accent/60 max-w-sm mx-auto">
                      <p className="text-foreground/90">
                        Mas sabia que com <span className="font-semibold text-primary">Eficiência Tributária</span> você pode
                        antecipar sua liberdade para{" "}
                        <span className="font-bold text-primary text-xl font-heading block mt-2">
                          {result.yearsOptimized.toFixed(1)} anos
                        </span>
                        ?
                      </p>
                    </div>

                    <a
                      href="#offer-expert"
                      className="inline-flex items-center justify-center w-full h-14 px-8 text-lg font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg shadow-secondary/10 hover:shadow-xl transition-all font-heading"
                    >
                      Conhecer Mentoria Wealth
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recalculate Button */}
            <Button
              variant="ghost"
              onClick={() => {
                setResult(null);
              }}
              className="w-full h-12 text-muted-foreground hover:text-foreground font-medium"
            >
              Fazer Nova Simulação
            </Button>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/60 mt-12 max-w-xs mx-auto leading-relaxed">
          * Simulação baseada em projeções de rentabilidade estimadas. Retornos passados não garantem ganhos futuros.
        </p>
      </div>
    </div>
  );
};

export default MillionCalculator;
