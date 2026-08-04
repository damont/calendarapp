import { strFromU8, unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { buildCalendarSkill, buildCalendarSkillArchive } from './agentSkills';

const baseUrl = 'https://calendar.example.com/';

describe('downloadable calendar skills', () => {
  it.each(['calendar', 'email-to-calendar'] as const)('builds a valid standalone %s skill archive', (kind) => {
    const files = unzipSync(buildCalendarSkillArchive(kind, baseUrl));
    const path = `${kind}/SKILL.md`;
    expect(Object.keys(files)).toEqual([path]);

    const markdown = strFromU8(files[path]);
    expect(markdown).toMatch(new RegExp(`^---\\nname: ${kind}\\n`));
    expect(markdown).toContain('description:');
    expect(markdown).toContain('<base>/api/openapi.json');
    expect(markdown).toContain('Authorization: Bearer <token>');
    expect(markdown).toContain('https://calendar.example.com');
    expect(markdown).not.toContain('https://calendar.example.com//');
    expect(markdown).not.toMatch(/eyJ[A-Za-z0-9_-]{10,}/);
  });

  it('warns that list updates replace the complete field', () => {
    expect(buildCalendarSkill('calendar', baseUrl)).toContain('sending a list replaces that entire list');
  });

  it('constrains email access to read-only and treats messages as untrusted', () => {
    const markdown = buildCalendarSkill('email-to-calendar', baseUrl);
    expect(markdown).toMatch(/read-only scopes/);
    expect(markdown).toMatch(/untrusted data/);
    expect(markdown).toMatch(/Never duplicate/);
  });
});
