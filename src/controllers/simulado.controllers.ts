import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client"; 
import { SimuladoCreateBody, AdicionarQuestaoBody } from "../types/simulado";

const prisma = new PrismaClient()

export const criarSimulado = async (req: Request, res: Response) => {
  try{
    const { nome, curso } = req.body as SimuladoCreateBody;

    const simulado = await prisma.simulado.create({
      data: { nome, curso }
    })
    
    const distribuição: Record<string,number> = {
      Português: 5,
      Matemática: 5,
      Física: 5,
      Química: 5,
      Biologia: 5,
      História: 5,
      Geografia: 5,
      Inglês: 5,
      Raciocínio: 5,
      Interpretação: 5
    }
    let posicao = 1

    for (const materia in distribuição){
      const quantidade = distribuição[materia]

      const questoes = await prisma.questao.findMany({
        where: {
          materia,
          curso
        },
        take: quantidade
      })

      for(const questao of questoes){
        await prisma.simuladoQuestao.create({
          data: {
            simuladoId: simulado.id,
            questaoId: questao.id,
            posicao: posicao++
          }
        })
      }
    }

    return res.status(201).json({
      mensagem:'Simulado criado com Sucesso',
      simuladoId: simulado.id
    })
  }

  catch(erro){
    return res.status(500).json({ erro: 'Erro ao criar simulado', detalhes: erro})
  }
}

export const listarSimulados = async (req: Request, res: Response)=>{
  try{
    const simulados = await prisma.simulado.findMany({
      include : { questoes: true }
    })
    return res.json(simulados)
  }
  catch(erro){
    return res.status(500).json({erro: 'Erro ao listar os Simulados', detalhes:erro})
  }
}

export const listarQuestoesDoSimulado = async ( req: Request, res: Response)=>{
  try{
    const simuladoId = req.params.id

    const questoes = await prisma.simuladoQuestao.findMany({
      where: { simuladoId },
      orderBy: { posicao: "asc"},
      include: { questao: true }
    })

    const questoesComPosicao = questoes.map((q)=>({
      ...q.questao,
      posicao: q.posicao
    }))

    return res.json(questoesComPosicao)
  }
  catch(erro){
    return res.status(500).json({erro:'Erro ao listar questões do simulado', detalhes: erro})
  }
}