export declare const selectToKnowIfHasP: (dados: any, quantidadeOdf: number, funcionario: string, numeroOperacao: string, codigoPeca: string) => Promise<{
    message: string;
    quantidade: number;
    reserved: never[];
    codigoFilho: never[];
    condic: string;
} | "Quantidade para reserva inválida" | "Algo deu errado" | "Não há item para reservar" | undefined>;
//# sourceMappingURL=selectIfHasP.d.ts.map