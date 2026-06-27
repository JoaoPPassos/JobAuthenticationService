import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateEmailCredentialDTO } from '../dto/create-email-credential.dto';
import { UpdateEmailCredentialDTO } from '../dto/update-email-credential.dto';
import { ChangePasswordDTO } from '../dto/change-password.dto';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { SuccessResponse } from '@shared/response/success.response';
import type { AuthTokenPayload } from '@domain/ports/IAuth.interface';
import type { MeResponse } from '@domain/use-cases/users/get-me.use-case';
import type { PublicEmailCredential } from '@domain/ports/IEmailCredentialRepository.interface';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get authenticated user with email credentials' })
  @ApiResponse({ status: 200, description: 'User data returned' })
  @Get('me')
  async getMe(
    @CurrentUser() user: AuthTokenPayload,
  ): Promise<SuccessResponse<MeResponse>> {
    const result = await this.usersService.getMe(user.id);
    return new SuccessResponse<MeResponse>(
      result,
      200,
      'User retrieved successfully',
    );
  }

  @ApiOperation({
    summary: 'List all email credentials for the authenticated user',
  })
  @ApiResponse({ status: 200, description: 'Credentials listed' })
  @Get('email-credentials')
  async getEmailCredentials(
    @CurrentUser() user: AuthTokenPayload,
  ): Promise<SuccessResponse<PublicEmailCredential[]>> {
    const result = await this.usersService.getEmailCredentials(user.id);
    return new SuccessResponse<PublicEmailCredential[]>(
      result,
      200,
      'Credentials retrieved successfully',
    );
  }

  @ApiOperation({ summary: 'Add an email credential for monitoring' })
  @ApiResponse({ status: 201, description: 'Credential created' })
  @Post('email-credentials')
  async createEmailCredential(
    @CurrentUser() user: AuthTokenPayload,
    @Body() body: CreateEmailCredentialDTO,
  ): Promise<SuccessResponse<PublicEmailCredential>> {
    const result = await this.usersService.createEmailCredential(user.id, body);
    return new SuccessResponse<PublicEmailCredential>(
      result,
      201,
      'Credential created successfully',
    );
  }

  @ApiOperation({ summary: 'Update an email credential' })
  @ApiResponse({ status: 200, description: 'Credential updated' })
  @ApiResponse({ status: 404, description: 'Credential not found' })
  @Patch('email-credentials/:id')
  async updateEmailCredential(
    @CurrentUser() user: AuthTokenPayload,
    @Param('id') id: string,
    @Body() body: UpdateEmailCredentialDTO,
  ): Promise<SuccessResponse<PublicEmailCredential>> {
    const result = await this.usersService.updateEmailCredential(
      id,
      user.id,
      body,
    );
    return new SuccessResponse<PublicEmailCredential>(
      result,
      200,
      'Credential updated successfully',
    );
  }

  @ApiOperation({ summary: 'Delete an email credential' })
  @ApiResponse({ status: 200, description: 'Credential deleted' })
  @ApiResponse({ status: 404, description: 'Credential not found' })
  @HttpCode(HttpStatus.OK)
  @Delete('email-credentials/:id')
  async deleteEmailCredential(
    @CurrentUser() user: AuthTokenPayload,
    @Param('id') id: string,
  ): Promise<SuccessResponse<null>> {
    await this.usersService.deleteEmailCredential(id, user.id);
    return new SuccessResponse<null>(
      null,
      200,
      'Credential deleted successfully',
    );
  }

  @ApiOperation({
    summary:
      'Request a password change code — sends 6-digit code to registered email',
  })
  @ApiResponse({ status: 200, description: 'Code sent to email' })
  @HttpCode(HttpStatus.OK)
  @Post('me/request-password-change')
  async requestPasswordChange(
    @CurrentUser() user: AuthTokenPayload,
  ): Promise<SuccessResponse<null>> {
    await this.usersService.requestPasswordChange(user.id);
    return new SuccessResponse<null>(
      null,
      200,
      'Password change code sent to your email',
    );
  }

  @ApiOperation({ summary: 'Change password using the code received by email' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  @ApiResponse({
    status: 403,
    description: "Cannot change another user's password",
  })
  @HttpCode(HttpStatus.OK)
  @Patch(':userId/password')
  async changePassword(
    @CurrentUser() requester: AuthTokenPayload,
    @Param('userId') userId: string,
    @Body() body: ChangePasswordDTO,
  ): Promise<SuccessResponse<null>> {
    await this.usersService.changePassword(
      requester.id,
      userId,
      body.code,
      body.new_password,
    );
    return new SuccessResponse<null>(
      null,
      200,
      'Password changed successfully',
    );
  }
}
