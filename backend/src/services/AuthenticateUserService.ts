/**
 * Receber code(string)
 * Recuperar o access token no github
 * recuperar infos do user github
 * Verificar se o usuario existe no DB
 * ---- Sim = gera um token
 * ---- Nao = Cria no DB, gera um token no
 * Retornar uo token com as infos do user
 */
import axios from "axios";
import prismaClient from "../prisma";
import { sign } from "jsonwebtoken";

interface IAccessTokenResponse {
  access_token: string;
}

interface IUserResponse {
  avatar_url: string;
  login: string;
  id: number;
  name: string;
}

class AuthenticateUserService {
  async execute(code: string) {
    const url = "https://github.com/login/oauth/access_token";

    const { data: accessTokenResponse } =
      await axios.post<IAccessTokenResponse>(url, null, {
        params: {
          client_id: "3df8cb6fd9b7b3edcb5f",
          client_secret: "4c7ee22f73d44b25ea85efcc06482d033607711a",
          code,
        },
        headers: {
          Accept: "application/json",
        },
      });

    const response = await axios.get<IUserResponse>(
      "https://api.github.com/user",
      {
        headers: {
          authorization: `Bearer ${accessTokenResponse.access_token}`,
        },
      }
    );

    const { login, id, avatar_url, name } = response.data;
    let user = await prismaClient.user.findFirst({
      where: {
        github_id: id,
      },
    });
    if (!user) {
      await prismaClient.user.create({
        data: {
          github_id: id,
          login,
          avatar_url,
          name,
        },
      });
    }
    const token = sign(
      {
        user: {
          name: user.name,
          avatar_url: user.avatar_url,
          id: user.id,
        },
      },
      "c92c6768599e5f60194e5e874da5e208",
      {
        subject: user.id,
        expiresIn: "1d",
      }
    );
    return { token, user };
  }
}

export { AuthenticateUserService };
