import { supabaseAdmin } from '@/shared/lib/supabase';

export interface VariationInput {
    headlineVersionId: string;
    weight: number;
}

export class ExperimentService {
    static async create(orgId: string, name: string, variations: VariationInput[]) {
        const { data: experiment, error: eError } = await supabaseAdmin
            .from('experiments')
            .insert({ organization_id: orgId, name })
            .select()
            .maybeSingle();

        if (eError || !experiment) throw eError || new Error('Failed to create experiment');

        const variationsToInsert = variations.map(v => ({
            experiment_id: experiment.id,
            headline_version_id: v.headlineVersionId,
            weight: v.weight
        }));

        const { error: vError } = await supabaseAdmin
            .from('experiment_variations')
            .insert(variationsToInsert);

        if (vError) throw vError;

        return experiment;
    }

    static async track(experimentId: string, variationId: string, type: 'impression' | 'conversion') {
        const column = type === 'impression' ? 'impressions' : 'conversions';

        // Atomic increment
        const { error } = await supabaseAdmin.rpc('increment_experiment_metric', {
            var_id: variationId,
            column_name: column
        });

        if (error) throw error;
    }
}
